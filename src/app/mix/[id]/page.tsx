import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MixPlayer } from './MixPlayer';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function MixPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if mix exists
  const { data: mix } = await supabase
    .from('mixes')
    .select('*')
    .eq('id', params.id)
    .single();

  // If mix doesn't exist, show 404
  if (!mix) {
    notFound();
  }

  return <MixPlayer id={params.id} />;
}