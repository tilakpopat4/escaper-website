import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

import { verifyAdmin } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const newPortfolio = await prisma.portfolio.create({
      data: {
        title: data.title,
        clientName: data.clientName || 'Escaper',
        category: data.category || 'Content',
        imageUrl: data.imageUrl || null,
        videoUrl: data.videoUrl || null,
      }
    });
    revalidatePath('/work');
    revalidatePath('/');
    return NextResponse.json(newPortfolio);
  } catch (error) {
    console.error("PORTFOLIO CREATION ERROR:", error);
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
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

    await prisma.portfolio.delete({ where: { id } });
    revalidatePath('/work');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, title, clientName, category, imageUrl, videoUrl, isFeatured, order } = data;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        title,
        clientName,
        category,
        imageUrl,
        videoUrl,
        isFeatured,
        order: order !== undefined ? Number(order) : undefined,
      }
    });
    revalidatePath('/work');
    revalidatePath('/');
    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error("PORTFOLIO UPDATE ERROR:", error);
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}
