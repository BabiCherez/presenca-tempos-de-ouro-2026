import React, { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

/**
 * Lente olho de peixe (olho mágico): distorção em barril via SVG feDisplacementMap,
 * recortada em círculo. O centro é ampliado e as bordas se curvam.
 */
export const Fisheye: React.FC<{ radius: number; strength?: number; children: React.ReactNode }> = ({
  radius,
  strength = 0.4,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const { url, scale } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const g = c.getContext("2d") as CanvasRenderingContext2D;
    const img = g.createImageData(width, height);
    const cx = width / 2;
    const cy = height / 2;
    // deslocamento: amostra a origem em c + (p - c) * gain(r); gain < 1 no centro → amplia
    const gain = (rn: number) => 1 - strength * (1 - rn * rn);
    let maxOff = 1;
    for (let i = 0; i <= 200; i++) {
      const rn = i / 200;
      maxOff = Math.max(maxOff, Math.abs(rn * radius * (gain(rn) - 1)));
    }
    const S = maxOff * 2.05;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        const rn = Math.min(r / radius, 1);
        const k = gain(rn) - 1;
        const ox = dx * k;
        const oy = dy * k;
        const i = (y * width + x) * 4;
        img.data[i] = Math.round((0.5 + ox / S) * 255);
        img.data[i + 1] = Math.round((0.5 + oy / S) * 255);
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return { url: c.toDataURL("image/png"), scale: S };
  }, [width, height, radius, strength]);

  return (
    <AbsoluteFill style={{ clipPath: `circle(${radius}px at 50% 50%)` }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="fisheye" x="0" y="0" width={width} height={height} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage href={url} x={0} y={0} width={width} height={height} result="map" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: "url(#fisheye)" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
