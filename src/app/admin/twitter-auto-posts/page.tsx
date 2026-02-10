'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ViralPrediction {
  id: string;
  rank: number;
  team: string;
  score: number;
  suggested_format: string;
  caption: string;
  hashtags: string;
  media_prompt: string;
  media_url: string | null;
  status: 'draft' | 'scheduled' | 'posted';
  tweet_id: string | null;
  posted_at: string | null;
  scheduled_for: string | null;
  created_at: string;
}

interface CronError {
  id: string;
  timestamp: string;
  error: string;
  source: string;
}

export default function TwitterAutoPostsPage() {
  const [predictions, setPredictions] = useState<ViralPrediction[]>([]);
  const [errors, setErrors] = useState<CronError[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [posting, setPosting] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    const { data } = await supabase
      .from('Twitter_viral_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setPredictions(data || []);
  }, []);

  const fetchErrors = useCallback(async () => {
    const { data } = await supabase
      .from('Twitter_cron_error_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
    setErrors(data || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPredictions(), fetchErrors()]);
      setLoading(false);
    };
    init();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPredictions();
      fetchErrors();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPredictions, fetchErrors]);

  const startEditing = (p: ViralPrediction) => {
    setEditingId(p.id);
    setEditCaption(p.caption);
  };

  const saveCaption = async (id: string) => {
    await supabase
      .from('Twitter_viral_predictions')
      .update({ caption: editCaption })
      .eq('id', id);
    setEditingId(null);
    fetchPredictions();
  };

  const handleFileUpload = async (id: string, file: File) => {
    setUploading(id);
    try {
      const fileName = `twitter-media/${id}-${Date.now()}-${file.name}`;
      await supabase.storage.from('media').upload(fileName, file);
      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
      await supabase
        .from('Twitter_viral_predictions')
        .update({ media_url: data.publicUrl })
        .eq('id', id);
      fetchPredictions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Upload failed: ' + errorMessage);
    }
    setUploading(null);
  };

  const handleSchedule = async (id: string, date: string) => {
    await supabase
      .from('Twitter_viral_predictions')
      .update({ scheduled_for: new Date(date).toISOString(), status: 'scheduled' })
      .eq('id', id);
    fetchPredictions();
  };

  const handlePostNow = async (p: ViralPrediction) => {
    setPosting(p.id);
    try {
      const res = await fetch('/api/post-to-x', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId: p.id,
          caption: `${p.caption} ${p.hashtags}`,
          mediaUrl: p.media_url
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      alert('Posted! Tweet ID: ' + result.tweetId);
      fetchPredictions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Post failed: ' + errorMessage);
    }
    setPosting(null);
  };

  const getTeamColor = (team: string) => {
    const colors: Record<string, string> = {
      Bears: 'bg-orange-600', Bulls: 'bg-red-600', Blackhawks: 'bg-red-700',
      Cubs: 'bg-blue-600', 'White Sox': 'bg-black'
    };
    return colors[team] || 'bg-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-yellow-500', scheduled: 'bg-blue-500', posted: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Twitter Auto Posts</h1>
        <p className="text-lg font-bold text-gray-300 bg-gray-800 p-4 rounded-lg">
          This page pulls daily viral story ideas from datalab.sportsmockery.com.
          The engine reads Media_Source.json, runs Claude every morning at 6 AM CST,
          applies the 5-criteria scoring system, stores ideas in Supabase table
          Twitter_viral_predictions, and surfaces them here. Edit caption, upload
          photo (to Supabase storage), see live embedded Twitter preview, schedule,
          or post immediately to @sportsmockery using Vercel Twitter keys. Error log
          at bottom shows cron job status from Twitter_cron_error_log.
        </p>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {predictions.map((p) => (
          <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getTeamColor(p.team)}`}>
                  {p.team}
                </span>
                <span className="text-2xl font-bold text-green-400">{p.score?.toFixed(1)}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(p.status)}`}>
                {p.status?.toUpperCase()}
              </span>
            </div>

            {p.media_url ? (
              <div className="aspect-video bg-gray-800">
                <img src={p.media_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 flex items-center justify-center text-gray-500 text-sm p-4 text-center">
                <div>
                  <p>No media. Prompt:</p>
                  <p className="italic">{p.media_prompt}</p>
                </div>
              </div>
            )}

            <div className="p-4">
              {editingId === p.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveCaption(p.id)} className="px-3 py-1 bg-green-600 rounded text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-600 rounded text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-200 mb-2">{p.caption}</p>
                  <p className="text-blue-400 text-sm">{p.hashtags}</p>
                  <button onClick={() => startEditing(p)} className="text-xs text-gray-500 hover:text-gray-300 mt-2">
                    Edit Caption
                  </button>
                </div>
              )}
            </div>

            {/* Twitter Preview */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <div className="bg-black rounded-lg p-3 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">SM</div>
                  <div>
                    <p className="font-bold text-sm">Sports Mockery</p>
                    <p className="text-gray-500 text-xs">@sportsmockery</p>
                  </div>
                </div>
                <p className="text-sm">{p.caption} {p.hashtags}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-800 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Upload Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(p.id, e.target.files[0])}
                  disabled={uploading === p.id}
                  className="w-full text-sm"
                />
                {uploading === p.id && <p className="text-xs text-yellow-400">Uploading...</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Schedule:</label>
                <input
                  type="datetime-local"
                  onChange={(e) => handleSchedule(p.id, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                />
              </div>

              <button
                onClick={() => handlePostNow(p)}
                disabled={posting === p.id || p.status === 'posted'}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold text-sm"
              >
                {posting === p.id ? 'Posting...' : 'Post Now'}
              </button>

              {p.tweet_id && (
                <p className="text-xs text-green-400">
                  <a href={`https://twitter.com/sportsmockery/status/${p.tweet_id}`} target="_blank" rel="noopener noreferrer">View Tweet</a>
                </p>
              )}
            </div>

            <div className="px-4 pb-4 text-xs text-gray-500">
              <p>Format: {p.suggested_format} | Rank: #{p.rank}</p>
              <p>Created: {new Date(p.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error Log */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-4 text-red-400">Cron Error Log</h2>
        {errors.length === 0 ? (
          <p className="text-gray-500">No recent errors</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Source</th>
                <th className="pb-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e) => (
                <tr key={e.id} className="border-b border-gray-800">
                  <td className="py-2 text-gray-400">{new Date(e.timestamp).toLocaleString()}</td>
                  <td className="py-2 text-yellow-400">{e.source}</td>
                  <td className="py-2 text-red-400">{e.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
