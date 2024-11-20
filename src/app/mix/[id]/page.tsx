import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MixPlayer } from './MixPlayer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: mix } = await supabase
    .from('mixes')
    .select('*')
    .eq('id', id)
    .single();

  if (!mix) {
    notFound();
  }

  return {
    title: mix.title,
    description: mix.description || 'Listen to this mix on MusicMilk',
    openGraph: {
      title: mix.title,
      description: mix.description || 'Listen to this mix on MusicMilk',
      images: [
        {
          url: mix.cover_url || '/images/logo.png',
          width: 1200,
          height: 630,
          alt: 'MusicMilk Logo'
        }
      ],
      type: 'music.song',
      siteName: 'MusicMilk',
    },
    twitter: {
      card: 'summary_large_image',
      title: mix.title,
      description: mix.description || 'Listen to this mix on MusicMilk',
      images: [mix.cover_url || '/images/logo.png'],
    }
  };
}

async function getMixData(id: string) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch mix data with chapters
  const { data: mix } = await supabase
    .from('mixes')
    .select(`
      *,
      chapters (
        id,
        title,
        timestamp,
        order
      )
    `)
    .eq('id', id)
    .single();

  if (!mix) {
    notFound();
  }

  // Get like count
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('mix_id', id);

  // Update play count
  await supabase
    .from('mixes')
    .update({ play_count: (mix.play_count || 0) + 1 })
    .eq('id', id);

  return {
    mix,
    likeCount: likeCount || 0
  };
}

export default async function MixPage({ params }: { params: Params }) {
  const { id } = await params;
  const { mix, likeCount } = await getMixData(id);
  
  return <MixPlayer 
    mix={mix} 
    initialLikeCount={likeCount}
  />;
}