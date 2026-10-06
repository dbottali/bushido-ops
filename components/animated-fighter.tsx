"use client";

import { useEffect, useRef, useState } from "react";
import atlases from "@/lib/fighter-atlases.json";

type FighterRole = "hero" | "warmup" | "quiz" | "footer" | "training";
type Character = keyof typeof atlases;
type Profile = { character: Character; period: number; phase: number; idleSpan: number; idle: number[]; bob: number[]; action: number[]; duration: number };
const profiles: Record<FighterRole, Profile> = {
  hero: { character: "ryu", period: 3200, phase: 0, idleSpan: 1400, idle: [0, 2, 3, 2, 0], bob: [0, -1, -2, -1, 0], action: [4, 5, 6, 6, 7, 0], duration: 900 },
  warmup: { character: "boxer", period: 3800, phase: 1400, idleSpan: 1200, idle: [0, 2, 0], bob: [0, 0, 0], action: [4, 5, 6, 6, 7, 0], duration: 780 },
  quiz: { character: "quiz", period: 4100, phase: 2400, idleSpan: 1100, idle: [0, 2, 3, 0], bob: [0, -1, -1, 0], action: [4, 5, 6, 6, 7, 0], duration: 850 },
  footer: { character: "ryu", period: 6200, phase: 3600, idleSpan: 0, idle: [0], bob: [0], action: [0, 1, 2, 0], duration: 650 },
  training: { character: "ryu", period: 3500, phase: 1000, idleSpan: 1200, idle: [0, 2, 3, 2, 0], bob: [0, -1, -2, -1, 0], action: [4, 5, 6, 6, 7, 0], duration: 900 },
};
const pixelPalette = [
  [10, 16, 32], [24, 35, 66], [39, 64, 105], [54, 93, 204],
  [72, 140, 222], [93, 49, 33], [150, 80, 32], [217, 136, 57],
  [255, 200, 112], [255, 225, 160], [152, 34, 24], [228, 51, 50],
  [255, 244, 218], [174, 179, 189], [105, 113, 128], [201, 166, 71],
];

/** Each source frame is a complete redrawn pose, including the shoulder and neck. */
export function AnimatedFighter({ className = "", role = "hero" }: { className?: string; role?: FighterRole }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const profile = profiles[role];
    const atlas = atlases[profile.character];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    const background = new Image();
    canvas.width = 192; canvas.height = 168;
    context.imageSmoothingEnabled = false;
    setReady(false);
    delete wrapper.dataset.loadError;

    let disposed = false, loaded = false, imageLoaded = false, backgroundLoaded = role === "training", visible = true;
    let timer = 0, reactionStarted = -Infinity, reactions = 0;
    let paint: (now: number, force?: boolean) => void = () => {};
    const stop = () => { window.clearTimeout(timer); timer = 0; };
    const schedule = () => {
      const needsMotion = profile.idleSpan > 0 || performance.now() - reactionStarted < profile.duration;
      if (!disposed && loaded && visible && !document.hidden && !motion.matches && !timer && needsMotion) timer = window.setTimeout(tick, 100);
    };
    const tick = () => {
      timer = 0;
      if (disposed || !visible || document.hidden || motion.matches) return;
      paint(performance.now()); schedule();
    };
    const initialize = () => {
      if (disposed || loaded || !imageLoaded || !backgroundLoaded) return;
      const frames = atlas.frames.map(rect => {
        const complete = document.createElement("canvas");
        complete.width = canvas.width; complete.height = canvas.height;
        const frameContext = complete.getContext("2d")!;
        frameContext.imageSmoothingEnabled = false;
        frameContext.drawImage(image, rect.x, rect.y, rect.w, rect.h,
          Math.round(84 - rect.anchorX * atlas.scale), Math.round(158 - rect.anchorY * atlas.scale),
          Math.round(rect.w * atlas.scale), Math.round(rect.h * atlas.scale));
        // Render on a 64 × 56 grid with sixteen solid colors, then enlarge whole pixels.
        const pixelFrame = document.createElement("canvas");
        pixelFrame.width = 64; pixelFrame.height = 56;
        const pixelContext = pixelFrame.getContext("2d", { willReadFrequently: true })!;
        pixelContext.imageSmoothingEnabled = false;
        pixelContext.drawImage(complete, 0, 0, pixelFrame.width, pixelFrame.height);
        const pixels = pixelContext.getImageData(0, 0, pixelFrame.width, pixelFrame.height);
        for (let p = 0; p < pixels.data.length; p += 4) {
          if (pixels.data[p + 3] < 128) { pixels.data[p + 3] = 0; continue; }
          let best = pixelPalette[0], distance = Infinity;
          for (const color of pixelPalette) {
            const r = pixels.data[p] - color[0], g = pixels.data[p + 1] - color[1], b = pixels.data[p + 2] - color[2];
            const difference = 2 * r * r + 4 * g * g + 3 * b * b;
            if (difference < distance) { distance = difference; best = color; }
          }
          pixels.data[p] = best[0]; pixels.data[p + 1] = best[1]; pixels.data[p + 2] = best[2]; pixels.data[p + 3] = 255;
        }
        pixelContext.putImageData(pixels, 0, 0);
        frameContext.clearRect(0, 0, complete.width, complete.height);
        frameContext.drawImage(pixelFrame, 0, 0, complete.width, complete.height);
        return complete;
      });
      const started = performance.now();
      let lastTick = -1, lastPose = "", firstPaint = true;
      paint = (now, force = false) => {
        const currentTick = Math.floor(now / 100);
        if (!force && currentTick === lastTick) return;
        lastTick = currentTick;
        const elapsed = now - reactionStarted;
        const reacting = !motion.matches && elapsed >= 0 && elapsed < profile.duration;
        let index = 0, bob = 0;
        if (reacting) {
          const step = Math.min(profile.action.length - 1, Math.floor(elapsed / profile.duration * profile.action.length));
          index = profile.action[step];
        } else if (!motion.matches && profile.idleSpan > 0) {
          const position = (now - started + profile.phase) % profile.period;
          if (position < profile.idleSpan) {
            const step = Math.min(profile.idle.length - 1, Math.floor(position / profile.idleSpan * profile.idle.length));
            index = profile.idle[step]; bob = profile.bob[step];
          }
        }
        const mode = motion.matches ? "reduced" : reacting ? "punch" : "quiet";
        const signature = `${mode}:${index}:${bob}`;
        if (!force && signature === lastPose) return;
        lastPose = signature;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(frames[index], 0, bob);
        wrapper.dataset.motion = mode;
        canvas.dataset.frame = String(index);
        canvas.dataset.bob = String(bob);
        if (firstPaint) { firstPaint = false; setReady(true); }
      };
      loaded = true; paint(performance.now(), true); schedule();
    };
    image.onload = () => { imageLoaded = true; initialize(); };
    image.onerror = () => { wrapper.dataset.loadError = "sprite"; };
    background.onload = () => { backgroundLoaded = true; initialize(); };
    background.onerror = () => { wrapper.dataset.loadError = "background"; };

    const host = wrapper.closest(".activity-card") ?? wrapper;
    const react = () => {
      if (!loaded || !visible || motion.matches || document.hidden) return;
      const now = performance.now();
      if (now - reactionStarted < 1800) return;
      reactionStarted = now;
      wrapper.dataset.reactions = String(++reactions);
      paint(now, true); schedule();
    };
    const onPointerEnter = (event: Event) => { if ((event as PointerEvent).pointerType === "mouse") react(); };
    let touchStart: { id: number; x: number; y: number } | null = null;
    const onPointerDown = (event: Event) => {
      const pointer = event as PointerEvent;
      if (pointer.isPrimary && pointer.pointerType !== "mouse") touchStart = { id: pointer.pointerId, x: pointer.clientX, y: pointer.clientY };
    };
    const onPointerUp = (event: Event) => {
      const pointer = event as PointerEvent;
      if (touchStart?.id === pointer.pointerId && Math.hypot(pointer.clientX - touchStart.x, pointer.clientY - touchStart.y) < 12) react();
      touchStart = null;
    };
    const onPointerCancel = () => { touchStart = null; };
    const onPreferenceChange = () => {
      reactionStarted = -Infinity; stop();
      if (loaded) paint(performance.now(), true);
      schedule();
    };
    const onVisibilityChange = () => {
      reactionStarted = -Infinity;
      if (document.hidden) stop();
      else { if (loaded) paint(performance.now(), true); schedule(); }
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? true;
      if (!visible) { reactionStarted = -Infinity; stop(); }
      else { if (loaded) paint(performance.now(), true); schedule(); }
    });
    host.addEventListener("pointerenter", onPointerEnter);
    host.addEventListener("pointerdown", onPointerDown, { passive: true });
    host.addEventListener("pointerup", onPointerUp, { passive: true });
    host.addEventListener("pointercancel", onPointerCancel);
    host.addEventListener("focusin", react);
    motion.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    observer.observe(wrapper);
    image.src = atlas.file;
    if (role !== "training") background.src = "./art/dojo-background-clean.png";
    return () => {
      disposed = true; stop(); observer.disconnect();
      host.removeEventListener("pointerenter", onPointerEnter);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerCancel);
      host.removeEventListener("focusin", react);
      motion.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      image.onload = null; image.onerror = null; background.onload = null; background.onerror = null;
    };
  }, [role]);

  return <div ref={wrapperRef} className={`arcade-fighter ${className}`} data-ready={ready} data-role={role} data-character={profiles[role].character} data-style="8-bit" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
