// app/api/media/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const configParam = searchParams.get('config');

  if (!configParam) {
    return NextResponse.json({ error: 'Config parameter is required' }, { status: 400 });
  }

  let folders: { path: string, sort: 'ordered' | 'random' }[] = [];
  try {
    folders = JSON.parse(configParam);
  } catch {
    return NextResponse.json({ error: 'Invalid config format' }, { status: 400 });
  }

  let combinedMedia: { type: string, src: string }[] = [];

  try {
    // Loop through the folders IN ORDER
    for (const folderConfig of folders) {
      const cleanFolder = folderConfig.path.trim();
      const sortMethod = folderConfig.sort;
      const dirPath = path.join(process.cwd(), 'public', cleanFolder);

      if (!fs.existsSync(dirPath)) {
        console.warn(`Directory not found, skipping: ${dirPath}`);
        continue;
      }

      const files = fs.readdirSync(dirPath);

      const folderMedia = files.map(file => {
        if (file.startsWith('.')) return null;
        
        const ext = path.extname(file).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
        const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);

        if (!isVideo && !isImage) return null;

        const match = file.match(/^(\d+)/);
        const num = match ? parseInt(match[1], 10) : 99999;

        return {
          type: isVideo ? 'video' : 'image',
          src: `/${cleanFolder}/${file}`,
          num: num
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      // Sort specifically for THIS folder based on its config
      if (sortMethod === 'ordered') {
        folderMedia.sort((a, b) => a.num - b.num);
      } else if (sortMethod === 'random') {
        for (let i = folderMedia.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [folderMedia[i], folderMedia[j]] = [folderMedia[j], folderMedia[i]];
        }
      }

      const cleanedMedia = folderMedia.map(m => ({ type: m.type, src: m.src }));
      combinedMedia = [...combinedMedia, ...cleanedMedia];
    }

    return NextResponse.json({ media: combinedMedia });

  } catch (error) {
    console.error("Error processing media directories:", error);
    return NextResponse.json({ media: [] }, { status: 500 });
  }
}