import fallbackSrc from '../assets/fallback.svg';

interface Props {
  src: string;
  className?: string;
  alt?: string;
}

// Img with automatic fallback to cute default when URL fails (e.g. offline)
export default function StickerImg({ src, className, alt }: Props) {
  return (
    <img
      src={src}
      className={className}
      alt={alt ?? ''}
      draggable={false}
      onError={e => {
        const img = e.target as HTMLImageElement;
        if (img.src !== window.location.origin + fallbackSrc) {
          img.src = fallbackSrc;
        }
      }}
    />
  );
}
