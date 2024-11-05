import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MixPlayer } from './MixPlayer';
import { notFound } from 'next/navigation';

export const revalidate = 0;

type Params = Promise<{ id: string }>;

export default async function MixPage({ 
  params 
}: { 
  params: Params 
}) {
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

  return <MixPlayer id={id} />;
}