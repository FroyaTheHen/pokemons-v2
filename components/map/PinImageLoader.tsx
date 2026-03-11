import { useEffect } from 'react';
import { ImageRef, useImage } from 'expo-image';

export function PinImageLoader({
  url,
  onLoad,
}: {
  url: string;
  onLoad: (url: string, ref: ImageRef) => void;
}) {
  const image = useImage(url);
  useEffect(() => {
    if (image) onLoad(url, image);
  }, [image, url, onLoad]);
  return null;
}
