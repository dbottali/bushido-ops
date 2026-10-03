import { useId } from "react";

/** Crop the approved illustration or its matching clean background at the same coordinates. */
export function DojoArt({ x, y, w, h, className = "", stretch = false, source = "./art/dojo-reference.png" }: {
  x: number; y: number; w: number; h: number; className?: string; stretch?: boolean; source?: string;
}) {
  const cropId = useId();
  return <svg className={`dojo-art ${className}`} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio={stretch ? "none" : "xMidYMid meet"} aria-hidden="true" focusable="false">
    <defs><clipPath id={cropId}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
    <image href={source} width="1672" height="941" preserveAspectRatio="none" clipPath={`url(#${cropId})`} />
  </svg>;
}
