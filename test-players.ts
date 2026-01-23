import { createClient } from '@supabase/supabase-js';

const datalabClient = createClient(
  'https://siwoqfzzcxmngnseyzpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDk0ODAsImV4cCI6MjA4MzIyNTQ4MH0.PzeJ6OG2ofjLWSpJ2UmI-1aXVrHnh3ar6eTgph4uJgc'
);

async function testBearsPlayers() {
  // Get active players
  const { data: active, count: activeCount } = await datalabClient
    .from('bears_players')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Get verified_2026 players
  const { data: verified, count: verifiedCount } = await datalabClient
    .from('bears_players')
    .select('*', { count: 'exact' })
    .eq('verified_2026', 'yes');

  console.log('=== Bears Players ===');
  console.log('Active players (is_active=true):', activeCount);
  console.log('Verified 2026 players:', verifiedCount);
  
  // Get positions breakdown for verified
  if (verified && verified.length > 0) {
    const positions: Record<string, number> = {};
    verified.forEach((p: any) => {
      positions[p.position] = (positions[p.position] || 0) + 1;
    });
    console.log('Positions:', positions);
  }
}

testBearsPlayers();
