import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // basic sanitize
    const finalName = `${uniqueSuffix}-${filename}`;
    
    // Save to public/uploads
    const fs = require('fs');
    const dir = join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const path = join(dir, finalName);
    await writeFile(path, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${finalName}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 });
  }
}
