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

export async function POST(request: Request) {
  try {
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
    return NextResponse.json(newPortfolio);
  } catch (error) {
    console.error("PORTFOLIO CREATION ERROR:", error);
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.portfolio.delete({ where: { id } });
    revalidatePath('/work');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
