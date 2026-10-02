import { useId } from "react";

/** Sample the supplied illustration without redrawing or modifying the source. */
export function DojoArt({ x, y, w, h, className = "", stretch = false }: {
  x: number; y: number; w: number; h: number; className?: string; stretch?: boolean;
}) {
  const cropId = useId();
  return <svg className={`dojo-art ${className}`} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio={stretch ? "none" : "xMidYMid meet"} aria-hidden="true" focusable="false">
    <defs><clipPath id={cropId}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
    <image href="./art/dojo-reference.png" width="1672" height="941" clipPath={`url(#${cropId})`} />
  </svg>;
}
