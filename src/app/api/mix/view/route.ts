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

    // First, get the current play_count
    const { data: mix, error: fetchError } = await supabase
      .from('mixes')
      .select('play_count')
      .eq('id', mixId)
      .single();

    if (fetchError || !mix) {
      console.error('Error fetching mix:', fetchError);
      return NextResponse.json({ error: 'Mix not found' }, { status: 404 });
    }

    // Increment play_count
    const { error: updateError } = await supabase
      .from('mixes')
      .update({ play_count: (mix.play_count || 0) + 1 })
      .eq('id', mixId);

    if (updateError) {
      console.error('Error incrementing play count:', updateError);
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

