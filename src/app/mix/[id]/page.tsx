import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MixPlayer } from './MixPlayer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }> | { id: string }
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  const { data: mix } = await supabase
    .from('mixes')
    .select('*')
    .eq('id', id)
    .single();

  if (!mix) {
    return {
      title: 'Mix Not Found | MusicMilk',
    };
  }

  return {
    title: `${mix.title} | MusicMilk`,
    description: mix.description || `Listen to ${mix.title} on MusicMilk`,
    openGraph: {
      title: mix.title,
      description: mix.description || `Listen to ${mix.title} on MusicMilk`,
      images: [
        {
          url: mix.cover_url || '/logo.png', // Fallback to your logo if no cover
          width: 1200,
          height: 630,
          alt: mix.title,
        }
      ],
      type: 'music.song',
      siteName: 'MusicMilk',
    },
    twitter: {
      card: 'summary_large_image',
      title: mix.title,
      description: mix.description || `Listen to ${mix.title} on MusicMilk`,
      images: [mix.cover_url || '/logo.png'], // Fallback to your logo if no cover
    },
  };
}

export default async function MixPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  const { data: mix } = await supabase
    .from('mixes')
    .select('*')
    .eq('id', id)
    .single();

  if (!mix) {
    notFound();
  }

  return <MixPlayer id={id} />;
}