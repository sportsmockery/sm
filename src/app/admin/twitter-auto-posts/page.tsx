'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      .order('rank', { ascending: true })
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

  // Team colors - background colors for badges
  const getTeamBgColor = (team: string) => {
    const colors: Record<string, string> = {
      Bears: '#F97316',        // orange
      Bulls: '#dc2626',        // red
      Blackhawks: '#991b1b',   // dark red
      Cubs: '#2563eb',         // blue
      'White Sox': '#000000'   // black
    };
    return colors[team] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      draft: { bg: '#eab308', text: '#000' },      // yellow
      scheduled: { bg: '#3b82f6', text: '#fff' },  // blue
      posted: { bg: '#22c55e', text: '#fff' }      // green
    };
    return colors[status] || { bg: '#6b7280', text: '#fff' };
  };

  // Group predictions by date
  const groupedPredictions = predictions.reduce((groups, p) => {
    const date = new Date(p.created_at).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(p);
    return groups;
  }, {} as Record<string, ViralPrediction[]>);

  // Theme-aware colors
  const bgPage = isDark ? '#030712' : '#f9fafb';
  const bgCard = isDark ? '#111827' : '#ffffff';
  const bgCardAlt = isDark ? '#1f2937' : '#f3f4f6';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textPrimary = isDark ? '#ffffff' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const inputBg = isDark ? '#1f2937' : '#ffffff';
  const inputBorder = isDark ? '#374151' : '#d1d5db';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: bgPage, color: textPrimary, padding: 32, textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgPage, color: textPrimary, padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Twitter Auto Posts</h1>
        <div style={{
          backgroundColor: bgCard,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          padding: 16,
          color: textSecondary,
          fontSize: 14,
          lineHeight: 1.6,
        }}>
          This page pulls daily viral story ideas from datalab.sportsmockery.com.
          The engine reads Media_Source.json, runs Claude every morning at 6 AM CST,
          applies the 5-criteria scoring system, stores ideas in Supabase table
          Twitter_viral_predictions, and surfaces them here. Edit caption, upload
          photo (to Supabase storage), see live embedded Twitter preview, schedule,
          or post immediately to @sportsmockery using Vercel Twitter keys. Error log
          at bottom shows cron job status from Twitter_cron_error_log.
        </div>
      </div>

      {/* Predictions by Date */}
      {Object.entries(groupedPredictions).map(([date, preds]) => (
        <div key={date} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: textPrimary }}>
            {date} <span style={{ color: textSecondary, fontWeight: 400 }}>({preds.length} predictions)</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
            {preds.map((p) => {
              const statusColors = getStatusColor(p.status);
              return (
                <div key={p.id} style={{
                  backgroundColor: bgCard,
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{
                    padding: 16,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        backgroundColor: getTeamBgColor(p.team),
                        color: '#fff',
                      }}>
                        {p.team}
                      </span>
                      <span style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>
                        {p.score?.toFixed(1)}
                      </span>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                      textTransform: 'uppercase',
                    }}>
                      {p.status}
                    </span>
                  </div>

                  {/* Media */}
                  {p.media_url ? (
                    <div style={{ aspectRatio: '16/9', backgroundColor: bgCardAlt }}>
                      <img src={p.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{
                      aspectRatio: '16/9',
                      backgroundColor: bgCardAlt,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: textSecondary,
                      fontSize: 13,
                      padding: 16,
                      textAlign: 'center',
                    }}>
                      <div>
                        <p style={{ marginBottom: 8 }}>No media. AI Prompt:</p>
                        <p style={{ fontStyle: 'italic', fontSize: 12 }}>{p.media_prompt}</p>
                      </div>
                    </div>
                  )}

                  {/* Caption */}
                  <div style={{ padding: 16 }}>
                    {editingId === p.id ? (
                      <div>
                        <textarea
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: inputBg,
                            border: `1px solid ${inputBorder}`,
                            borderRadius: 8,
                            padding: 8,
                            color: textPrimary,
                            fontSize: 14,
                            resize: 'vertical',
                            minHeight: 80,
                          }}
                          rows={3}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            onClick={() => saveCaption(p.id)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: '#22c55e',
                              color: '#fff',
                              borderRadius: 6,
                              border: 'none',
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: isDark ? '#374151' : '#e5e7eb',
                              color: textPrimary,
                              borderRadius: 6,
                              border: 'none',
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ color: textPrimary, marginBottom: 8, lineHeight: 1.5 }}>{p.caption}</p>
                        <p style={{ color: '#3b82f6', fontSize: 13 }}>{p.hashtags}</p>
                        <button
                          onClick={() => startEditing(p)}
                          style={{
                            marginTop: 8,
                            background: 'none',
                            border: 'none',
                            color: textSecondary,
                            fontSize: 12,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Edit Caption
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Twitter Preview */}
                  <div style={{
                    padding: 16,
                    backgroundColor: bgCardAlt,
                    borderTop: `1px solid ${borderColor}`,
                  }}>
                    <p style={{ fontSize: 11, color: textSecondary, marginBottom: 8 }}>Preview:</p>
                    <div style={{
                      backgroundColor: isDark ? '#000' : '#fff',
                      borderRadius: 12,
                      padding: 12,
                      border: `1px solid ${borderColor}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          backgroundColor: '#bc0000',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#fff',
                        }}>
                          SM
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13, color: textPrimary }}>Sports Mockery</p>
                          <p style={{ color: textSecondary, fontSize: 11 }}>@sportsmockery</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: textPrimary, lineHeight: 1.4 }}>
                        {p.caption} <span style={{ color: '#3b82f6' }}>{p.hashtags}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    padding: 16,
                    borderTop: `1px solid ${borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: textSecondary, marginBottom: 4 }}>
                        Upload Photo:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(p.id, e.target.files[0])}
                        disabled={uploading === p.id}
                        style={{ fontSize: 13, color: textPrimary }}
                      />
                      {uploading === p.id && (
                        <p style={{ fontSize: 11, color: '#eab308', marginTop: 4 }}>Uploading...</p>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: textSecondary, marginBottom: 4 }}>
                        Schedule:
                      </label>
                      <input
                        type="datetime-local"
                        onChange={(e) => handleSchedule(p.id, e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: inputBg,
                          border: `1px solid ${inputBorder}`,
                          borderRadius: 6,
                          padding: 8,
                          fontSize: 13,
                          color: textPrimary,
                        }}
                      />
                    </div>

                    <button
                      onClick={() => handlePostNow(p)}
                      disabled={posting === p.id || p.status === 'posted'}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        backgroundColor: posting === p.id || p.status === 'posted' ? '#6b7280' : '#3b82f6',
                        color: '#fff',
                        borderRadius: 8,
                        border: 'none',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: posting === p.id || p.status === 'posted' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {posting === p.id ? 'Posting...' : p.status === 'posted' ? 'Already Posted' : 'Post Now'}
                    </button>

                    {p.tweet_id && (
                      <p style={{ fontSize: 12, color: '#22c55e' }}>
                        <a
                          href={`https://twitter.com/sportsmockery/status/${p.tweet_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#22c55e', textDecoration: 'underline' }}
                        >
                          View Tweet →
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Meta info */}
                  <div style={{
                    padding: '12px 16px',
                    borderTop: `1px solid ${borderColor}`,
                    fontSize: 11,
                    color: textSecondary,
                  }}>
                    <p>Format: {p.suggested_format} | Rank: #{p.rank}</p>
                    <p>Created: {new Date(p.created_at).toLocaleString()}</p>
                    {p.scheduled_for && (
                      <p style={{ color: '#3b82f6' }}>Scheduled: {new Date(p.scheduled_for).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {predictions.length === 0 && (
        <div style={{
          backgroundColor: bgCard,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          color: textSecondary,
        }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No viral predictions yet</p>
          <p style={{ fontSize: 13 }}>New predictions appear daily at 6:00 AM CST</p>
        </div>
      )}

      {/* Error Log */}
      <div style={{
        marginTop: 48,
        backgroundColor: bgCard,
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
        padding: 24,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#ef4444' }}>
          Cron Error Log
        </h2>
        {errors.length === 0 ? (
          <p style={{ color: textSecondary }}>No recent errors</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${borderColor}` }}>
                  <th style={{ padding: '8px 12px', color: textSecondary }}>Timestamp</th>
                  <th style={{ padding: '8px 12px', color: textSecondary }}>Source</th>
                  <th style={{ padding: '8px 12px', color: textSecondary }}>Error</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e) => (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <td style={{ padding: '12px', color: textSecondary }}>
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', color: '#eab308' }}>{e.source}</td>
                    <td style={{ padding: '12px', color: '#ef4444' }}>{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
