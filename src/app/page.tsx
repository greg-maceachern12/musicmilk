import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import HomeClient from './HomeClient';
import { Mix } from './components/PopularMixes';

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const cookieStore = await cookies();
  // @ts-expect-error - The library expects a Promise but runtime needs the value
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data } = await supabase
    .from('mixes')
    .select('id, title, artist, genre, audio_url, cover_url, play_count, created_at')
    .order('play_count', { ascending: false })
    .limit(3);

  const popularMixes = (data || []) as Mix[];

  return <HomeClient popularMixes={popularMixes} />;
}
