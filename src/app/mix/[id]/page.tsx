import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MixPlayer } from './MixPlayer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

type Params = Promise<{ id: string }>;

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: Params 
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: mix } = await supabase
    .from('mixes')
    .select(`
      *,
      mix_artists!left(
        artists(
          id,
          name,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!mix) {
    notFound();
  }

  const artists = mix.mix_artists
    ?.map(ma => ma.artists.name)
    .join(', ');

  return {
    title: mix.title,
    description: mix.description || 'Listen to this mix on MusicMilk',
    openGraph: {
      title: `${mix.title}${artists ? ` by ${artists}` : ''}`,
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
      title: `${mix.title}${artists ? ` by ${artists}` : ''}`,
      description: mix.description || 'Listen to this mix on MusicMilk',
      images: [mix.cover_url || '/images/logo.png'],
    }
  };
}

export default async function MixPage({ 
  params 
}: { 
  params: Params 
}) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: mix } = await supabase
    .from('mixes')
    .select(`
      *,
      mix_artists!left(
        artists(
          id,
          name,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!mix) {
    notFound();
  }

  return <MixPlayer id={id} />;
}