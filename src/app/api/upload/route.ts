import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // basic sanitize
    const finalName = `${uniqueSuffix}-${filename}`;
    
    // Upload to Vercel Blob
    const blob = await put(finalName, file, {
      access: 'public',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 });
  }
}
