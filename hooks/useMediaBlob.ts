"use client";

import { useState, useEffect } from "react";
import { MediaType } from "@/components/MediaModal";

interface UseMediaBlobResult {
  blobUrl: string | null;
  progress: number;
  isFetching: boolean;
  error: string | null;
}

export function useMediaBlob(src: string, type: MediaType): UseMediaBlobResult {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For images, let Next.js <Image> handle optimization natively without blob-fetching
    if (type !== "video" || !src) {
      setBlobUrl(src);
      setIsFetching(false);
      setProgress(100);
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;
    let isMounted = true;

    async function fetchVideo() {
      try {
        setIsFetching(true);
        setProgress(0);
        setError(null);
        setBlobUrl(null);

        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const contentLengthHeader = response.headers.get("Content-Length");
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
        
        // If content length is missing, fallback to basic blob extraction without progress math
        if (!response.body || !contentLength) {
          const blob = await response.blob();
          if (!isMounted) return;
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          setProgress(100);
          setIsFetching(false);
          return;
        }

        const reader = response.body.getReader();
        // FIXED: Declared as BlobPart[] to satisfy TypeScript strict DOM typings
        const chunks: BlobPart[] = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            // FIXED: Safely cast Uint8Array to BlobPart to bypass SharedArrayBuffer strictness
            chunks.push(value as unknown as BlobPart);
            receivedLength += value.length;
            if (isMounted) {
              setProgress(Math.round((receivedLength / contentLength) * 100));
            }
          }
        }

        const blob = new Blob(chunks, { type: "video/mp4" });
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setIsFetching(false);
      } catch (err: any) {
        if (err.name !== "AbortError" && isMounted) {
          console.error("Blob fetch error:", err);
          setError(err.message || "Failed to load media");
          setIsFetching(false);
          // Fallback: feed the raw S3 URL directly if network chunking fails
          setBlobUrl(src);
        }
      }
    }

    fetchVideo();

    return () => {
      isMounted = false;
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, type]);

  return { blobUrl, progress, isFetching, error };
}