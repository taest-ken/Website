// app/api/media/route.ts
import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import path from 'path';

// Initialize the AWS Client
const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const BUCKET_NAME = 'taest-production-media';
const BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL;


export async function GET(request: Request) {
  console.log("Checking Credentials...");
  console.log("Access Key exists:", !!process.env.AWS_ACCESS_KEY_ID);
  console.log("Secret Key exists:", !!process.env.AWS_SECRET_ACCESS_KEY);
  

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
     return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }
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

  let combinedMedia: { type: string, src: string, num: number }[] = [];

  try {
    // Loop through the folders IN ORDER
    for (const folderConfig of folders) {
      // Strip leading slashes for AWS S3 Prefix formatting
      const cleanFolder = folderConfig.path.trim().replace(/^\/+/, '');
      const sortMethod = folderConfig.sort;

      // Ask AWS for the list of files in this specific folder
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `${cleanFolder}/`,
      });

      const response = await s3Client.send(command);
      
      // If folder is empty or doesn't exist, skip
      if (!response.Contents) continue;

      // Extract just the filenames from the AWS response
      const files = response.Contents
        .map(item => item.Key?.replace(`${cleanFolder}/`, ''))
        .filter(Boolean) as string[];

      // Apply your exact original logic
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
          // Return the absolute S3 URL so the frontend can render it immediately
          src: `${BASE_URL}/${cleanFolder}/${file}`,
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

      combinedMedia.push(...folderMedia);
    }

    return NextResponse.json({ media: combinedMedia });

  } catch (error) {
    console.error("S3 Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch media from AWS' }, { status: 500 });
  }
  
}