"use client";

import { useState } from "react";

type MentorAvatarProps = {
  name: string;
  imageUrl?: string;
  size?: "md" | "lg";
};

const sizeClasses = {
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-lg",
};

const sizePx = {
  md: 56,
  lg: 80,
} as const;

export function MentorAvatar({
  name,
  imageUrl,
  size = "md",
}: MentorAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name.slice(0, 1).toUpperCase();
  const showImage = imageUrl && !imgFailed;
  const px = sizePx[size];

  return (
    <div
      className={`relative ${sizeClasses[size]} shrink-0 overflow-hidden rounded-full border border-border bg-muted`}
      aria-hidden={!showImage}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          width={px}
          height={px}
          decoding="async"
          onError={() => setImgFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center font-semibold text-muted-foreground">
          {initial}
        </span>
      )}
    </div>
  );
}
