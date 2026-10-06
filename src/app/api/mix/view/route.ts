import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mixId } = await request.json();

    if (!mixId) {
      return NextResponse.json({ error: 'mixId is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    // @ts-expect-error - The library expects a Promise but runtime needs the value
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Atomic increment. play_count is not directly writable under owner-only RLS;
    // anon and authenticated may only change it through this SECURITY DEFINER function.
    const { error } = await supabase.rpc('increment_mix_play_count', {
      mix_id: mixId,
    });

    if (error) {
      console.error('Error incrementing play count:', error);
      return NextResponse.json({ error: 'Failed to increment play count' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in view route:', error);
    return NextResponse.json(
      { error: 'Failed to increment play count' },
      { status: 500 }
    );
  }
}
