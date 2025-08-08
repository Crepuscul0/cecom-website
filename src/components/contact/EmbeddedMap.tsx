interface EmbeddedMapProps {
  address: string;
  embedUrl: string;
  className?: string;
}

export default function EmbeddedMap({ address, embedUrl, className = "" }: EmbeddedMapProps) {
  return (
    <div className={`relative w-full h-64 md:h-80 lg:h-96 ${className}`}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing location: ${address}`}
        className="rounded-lg shadow-md"
      />
    </div>
  );
}