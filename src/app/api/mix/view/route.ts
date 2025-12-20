import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { mixId } = await request.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Increment play_count atomically
  // We use the rpc call if we had a stored procedure, or just update.
  // Since we don't have a specific RPC for increment, we can do a read-modify-write or just use raw SQL via rpc if available.
  // But standard supabase-js doesn't support atomic increment easily without RPC.
  // However, for play counts, exact precision isn't always critical, or we can use an RPC.
  
  // Let's try to do it via a simple RPC if possible, otherwise read-update.
  // Actually, we can use the `increment_play_count` function if we create it, which is better for concurrency.
  // But for now, to avoid complex migrations, I'll just do a select-update loop or a raw query if I could.
  // But I can't do raw query easily here without `supabase-admin`.
  
  // Let's check if we can creating a quick RPC function for this is best practice.
  // I will create an RPC function `increment_mix_play_count` first.
  
  try {
     const { error } = await supabase.rpc('increment_mix_play_count', { mix_id: mixId });
     if (error) throw error;
     return NextResponse.json({ success: true });
  } catch (error) {
     console.error('Error incrementing play count:', error);
     return NextResponse.json({ error: 'Failed to increment play count' }, { status: 500 });
  }
}

