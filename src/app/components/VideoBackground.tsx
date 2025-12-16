import { useState, useEffect } from 'react';
import { getBackgroundImages } from '../../api';

interface VideoBackgroundProps {
  forcedUrl: string | null;
}

export function VideoBackground({ forcedUrl }: VideoBackgroundProps) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (forcedUrl) {
      setCurrentUrl(forcedUrl);
      return;
    }

    // Default search for a nice portfolio background
    getBackgroundImages("abstract dark gradient", "motion-backgrounds")
      .then((images) => {
        if (images.length > 0) {
          setCurrentUrl(images[0]);
        }
      })
      .catch(console.error);
  }, [forcedUrl]);

  // Simple heuristic: Unsplash links are images, Pexels video links usually end in .mp4 or are clearly not unsplash images.
  // We can also check extensions, but Pexels API links might differ. 
  // Code in controller ensures pexels links are likely .mp4 (link property).
  // Safest check: assume video unless known image domain or extension.
  const isVideo = (url: string) => {
    if (!url) return false;
    if (url.includes('images.unsplash.com')) return false;
    if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) return false;
    return true; // Assume video for Pexels URLs
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-slate-900">
      {currentUrl ? (
        isVideo(currentUrl) ? (
          <video
            key={currentUrl} // Force reload on URL change
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000"
          >
            <source src={currentUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${currentUrl})` }}
          />
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient" />
      )}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Optional: Animated particles effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}
