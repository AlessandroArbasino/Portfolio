import { ImageWithFallback } from './figma/ImageWithFallback';
import { useMedia } from '../context/MediaContext';
import { isVideo } from '../../utils/mediaUtils';

interface MediaRendererProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
}

export function MediaRenderer({ src, alt, className, style, ...rest }: MediaRendererProps) {
    const { openMedia } = useMedia();
    const isVid = isVideo(src);

    // Use object-contain for all media to respect original aspect ratio without zooming
    const normalizedClassName = className?.includes('object-cover')
        ? className.replace('object-cover', 'object-contain')
        : className;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openMedia(src, isVid);
    };

    if (isVid) {
        // Extract video-compatible props from rest to avoid React type warnings/errors
        const {
            // Omit image specific props that might be in rest
            crossOrigin: _crossOrigin,
            decoding: _decoding,
            loading: _loading,
            referrerPolicy: _referrerPolicy,
            useMap: _useMap,
            ...videoProps
        } = rest as any;

        return (
            <video
                src={src}
                className={`${normalizedClassName} cursor-pointer`}
                style={style}
                autoPlay
                muted
                loop
                playsInline
                onClick={handleClick}
                {...videoProps}
            />
        );
    }

    return (
        <div onClick={handleClick} className="cursor-pointer h-full w-full">
            <ImageWithFallback
                src={src}
                alt={alt}
                className={normalizedClassName}
                style={style}
                {...rest}
            />
        </div>
    );
}
