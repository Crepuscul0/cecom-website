'use client';


interface LogoProps {
  logo: string;
  name: string;
}

export function Logo({ logo, name }: LogoProps) {
  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-muted to-accent rounded-lg overflow-hidden flex items-center justify-center p-4 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
      <img
        src={logo}
        alt={name}
        className="max-w-full max-h-full object-contain bg-transparent dark:brightness-0 dark:invert transition-all duration-300"
      />
    </div>
  );
}
