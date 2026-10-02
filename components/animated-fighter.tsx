"use client";

import { useEffect, useRef, useState } from "react";

/** A small pixel-art rig. Every visible pixel comes from the supplied character. */
export function AnimatedFighter({ className = "", punch = false, delay = 0 }: {
  className?: string; punch?: boolean; delay?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    setReady(false);
    let disposed = false;
    let frame = 0;
    let visible = true;
    let hoverPunch = -Infinity;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    const sourceW = 120, sourceH = 148;
    canvas.width = 154; canvas.height = 158;
    context.imageSmoothingEnabled = false;

    function makeLayer(source: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
      const layer = document.createElement("canvas");
      layer.width = w; layer.height = h;
      layer.getContext("2d")!.drawImage(source, x, y, w, h, 0, 0, w, h);
      return layer;
    }

    image.onload = () => {
      if (disposed) return;
      const sprite = document.createElement("canvas");
      sprite.width = sourceW; sprite.height = sourceH;
      const spriteContext = sprite.getContext("2d", { willReadFrequently: true })!;
      spriteContext.imageSmoothingEnabled = false;
      spriteContext.drawImage(image, 819, 168, sourceW, sourceH, 0, 0, sourceW, sourceH);
      const pixels = spriteContext.getImageData(0, 0, sourceW, sourceH);
      // Flood the connected light wall from the perimeter, preserving the white
      // gi enclosed by its dark pixel outline. This is a runtime sprite mask.
      const visited = new Uint8Array(sourceW * sourceH);
      const queue = new Uint32Array(sourceW * sourceH);
      let tail = 0, head = 0;
      const visit = (index: number) => {
        if (index < 0 || index >= visited.length || visited[index]) return;
        const p = index * 4;
        if (pixels.data[p] < 177 || pixels.data[p + 1] < 151 || pixels.data[p + 2] < 126) return;
        visited[index] = 1; queue[tail++] = index;
      };
      for (let x = 0; x < sourceW; x++) { visit(x); visit((sourceH - 1) * sourceW + x); }
      for (let y = 0; y < sourceH; y++) { visit(y * sourceW); visit(y * sourceW + sourceW - 1); }
      while (head < tail) {
        const index = queue[head++];
        pixels.data[index * 4 + 3] = 0;
        if (index % sourceW > 0) visit(index - 1);
        if (index % sourceW < sourceW - 1) visit(index + 1);
        visit(index - sourceW); visit(index + sourceW);
      }
      spriteContext.putImageData(pixels, 0, 0);
      const headLayer = makeLayer(sprite, 0, 0, sourceW, 47);
      const armLayer = makeLayer(sprite, 72, 46, 48, 48);
      const body = makeLayer(sprite, 0, 0, sourceW, sourceH);
      const bodyContext = body.getContext("2d")!;
      bodyContext.clearRect(0, 0, sourceW, 47);
      bodyContext.clearRect(72, 46, 48, 48);
      const started = performance.now();
      let lastTick = -1;
      let firstPaint = true;

      const draw = (now: number) => {
        if (disposed) return;
        if (visible || motion.matches) {
          const tick = Math.floor((now - started + delay) / 125);
          if (tick !== lastTick || motion.matches) {
            lastTick = tick;
            const idle = motion.matches ? 0 : [0, 1, 2, 1][tick % 4];
            const cycle = (now - started + delay) % 4200;
            const hoverTime = now - hoverPunch;
            const attackTime = hoverTime < 500 ? hoverTime : punch && cycle > 3600 ? cycle - 3600 : -1;
            const attack = motion.matches || attackTime < 0 ? 0 : Math.min(3, Math.floor(attackTime / 125));
            const poses = [{ x: 0, y: 0, angle: 0 }, { x: -4, y: 1, angle: .08 }, { x: 13, y: -5, angle: -.16 }, { x: 3, y: -2, angle: -.05 }];
            const pose = poses[attack];
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Keep feet planted while the upper body breathes in four steps.
            context.drawImage(body, 0, 100, sourceW, 48, 9, 105, sourceW, 48);
            context.drawImage(body, 0, 47, sourceW, 53, 9, 52 + idle, sourceW, 53);
            context.drawImage(headLayer, 9, 5 + idle);
            context.save();
            context.translate(81 + pose.x, 76 + pose.y + idle);
            context.rotate(pose.angle);
            context.drawImage(armLayer, 0, -25);
            context.restore();
            if (firstPaint) { firstPaint = false; setReady(true); }
          }
        }
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
    };
    const host = wrapper.closest(".activity-card, .hero, .journey-footer, .training-intro") ?? wrapper;
    const react = () => { hoverPunch = performance.now(); };
    host.addEventListener("pointerenter", react);
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; });
    observer.observe(wrapper);
    image.src = "./art/dojo-reference.png";
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); host.removeEventListener("pointerenter", react); image.onload = null; };
  }, [delay, punch]);

  return <div ref={wrapperRef} className={`arcade-fighter ${className}`} data-ready={ready} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
