// import { prisma } from '@/lib/prisma'

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const mix = await prisma.mix.findUnique({
//       where: { id: params.id }
//     });

//     if (!mix) {
//       return Response.json({ error: 'Mix not found' }, { status: 404 });
//     }

//     return Response.json(mix);
//   } catch (error) {
//     console.error('Failed to fetch mix:', error);
//     return Response.json({ error: 'Failed to fetch mix' }, { status: 500 });
//   }
// }