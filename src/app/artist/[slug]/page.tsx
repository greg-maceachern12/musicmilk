// page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ArtistContent } from './ArtistContent';

export default async function ArtistPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: artist } = await supabase
    .from('artists')
    .select()
    .eq('slug', slug)
    .single();

  return <ArtistContent initialArtist={artist} slug={slug} />;
}