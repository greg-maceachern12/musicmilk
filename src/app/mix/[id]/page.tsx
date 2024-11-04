import { MixPlayer } from './MixPlayer';

export default function MixPage({ params }: { params: { id: string } }) {
  return <MixPlayer id={params.id} />;
}