import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

import { verifyAdmin } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const newClient = await prisma.client.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        instagramUrl: data.instagramUrl,
      }
    });
    revalidatePath('/');
    return NextResponse.json(newClient);
  } catch (error) {
    console.error("CLIENT CREATION ERROR:", error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.client.delete({ where: { id } });
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
