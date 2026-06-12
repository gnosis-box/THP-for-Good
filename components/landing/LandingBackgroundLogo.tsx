import Image from 'next/image';

/** Large left-edge watermark — hoodie logo, half off-screen, faded on dark bg. */
export function LandingBackgroundLogo() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[78%] overflow-hidden sm:w-[62%] md:w-[52%]"
      aria-hidden
    >
      <Image
        src="/landing-watermark-logo.png"
        alt=""
        width={720}
        height={720}
        sizes="(max-width: 640px) 78vw, 52vw"
        className="absolute top-1/2 left-0 h-[min(84dvh,38rem)] w-auto max-w-none -translate-x-[48%] -translate-y-1/2 opacity-[0.14] mix-blend-lighten [mask-image:linear-gradient(to_right,black_50%,transparent_92%)] sm:h-[min(90dvh,44rem)] sm:-translate-x-[45%] sm:opacity-[0.16] md:h-[min(94dvh,50rem)] md:-translate-x-[42%] md:opacity-[0.18]"
      />
    </div>
  );
}
