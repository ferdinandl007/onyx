"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function SportradarLogo({
  height = 32,
  width = 160,
  className = "",
}: {
  height?: number;
  width?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null to prevent hydration mismatch
    // and avoid rendering the wrong logo pre-hydration.
    // A styled div matching the logo's dimensions can prevent layout shifts.
    return <div style={{ height, width }} className={className} />;
  }

  const isDarkMode = resolvedTheme === "dark";
  const logoSrc = isDarkMode ? "/Sportradar_logo_ dark_mode.png" : "/Sportradar_logo_ light_mode.png";

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <Image
        key={logoSrc} // Force re-render when src changes
        src={logoSrc}
        alt="Sportradar Logo"
        fill
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
} 