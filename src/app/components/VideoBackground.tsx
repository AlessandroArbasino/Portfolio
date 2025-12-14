import { useState, useEffect } from 'react';
import { getBackgroundImages } from '../../api';

interface VideoBackgroundProps {
  forcedUrl: string | null;
}

export function VideoBackground({ forcedUrl }: VideoBackgroundProps) {
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    if (forcedUrl) {
      setBgImage(forcedUrl);
      return;
    }

    // Default search for a nice portfolio background
    getBackgroundImages("abstract dark gradient", "motion-backgrounds")
      .then((images) => {
        if (images.length > 0) {
          setBgImage(images[0]);
        }
      })
      .catch(console.error);
  }, [forcedUrl]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {/* Background Image or Gradient */}
      {bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient" />
      )}

      {/* Uncomment this when you have a video file */}
      {/* <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/path-to-your-video.mp4" type="video/mp4" />
      </video> */}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Optional: Animated particles effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}
