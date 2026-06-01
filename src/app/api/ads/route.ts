import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

import { verifyAdmin } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const newAd = await prisma.ad.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        isActive: data.isActive ?? true,
      }
    });
    revalidatePath('/');
    return NextResponse.json(newAd);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
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

    await prisma.ad.delete({ where: { id } });
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, title, description, imageUrl, linkUrl, isActive, order } = data;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        isActive,
        order: order !== undefined ? Number(order) : undefined,
      }
    });
    revalidatePath('/');
    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("AD UPDATE ERROR:", error);
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
  }
}
