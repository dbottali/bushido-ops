"use client";

import { useEffect, useRef, useState } from "react";

type FighterRole = "hero" | "warmup" | "quiz" | "footer" | "training";
type Pose = { x: number; y: number };
const rest: Pose = { x: 0, y: 0 };
const profiles: Record<FighterRole, { period: number; phase: number; duration: number; attention: Pose[] }> = {
  hero: { period: 5200, phase: 0, duration: 900, attention: [rest, { x: 0, y: -1 }, { x: 2, y: -1 }, { x: 1, y: 0 }, rest] },
  warmup: { period: 6700, phase: 1500, duration: 1050, attention: [rest, { x: 0, y: -1 }, { x: -2, y: 0 }, { x: 0, y: -1 }, rest] },
  quiz: { period: 6100, phase: 3200, duration: 850, attention: [rest, { x: -1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: -1 }, rest] },
  footer: { period: 7900, phase: 4100, duration: 1000, attention: [rest, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, rest] },
  training: { period: 7300, phase: 900, duration: 800, attention: [rest, { x: 0, y: -1 }, { x: 1, y: -1 }, rest] },
};

/** Complete character frames keep the outline intact; quiet idle, one hover reaction. */
export function AnimatedFighter({ className = "", role = "hero" }: {
  className?: string; role?: FighterRole;
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

    const profile = profiles[role];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    const sourceW = 120, sourceH = 152;
    canvas.width = 154; canvas.height = 158;
    context.imageSmoothingEnabled = false;
    setReady(false);

    let disposed = false;
    let loaded = false;
    let visible = true;
    let frame = 0;
    let reactionStarted = -Infinity;
    let reactions = 0;
    let paint: (now: number, force?: boolean) => void = () => {};

    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const schedule = () => {
      if (!disposed && loaded && visible && !document.hidden && !motion.matches && !frame) {
        frame = requestAnimationFrame(tick);
      }
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      paint(now);
      schedule();
    };

    image.onload = () => {
      if (disposed) return;
      const sprite = document.createElement("canvas");
      sprite.width = sourceW; sprite.height = sourceH;
      const spriteContext = sprite.getContext("2d", { willReadFrequently: true });
      if (!spriteContext) return;
      spriteContext.imageSmoothingEnabled = false;
      spriteContext.drawImage(image, 819, 168, sourceW, sourceH, 0, 0, sourceW, sourceH);
      const pixels = spriteContext.getImageData(0, 0, sourceW, sourceH);

      // Remove the connected wall, keeping the original character in one piece.
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
      // The wall between the legs is enclosed by the character and the floor.
      visit(123 * sourceW + 62);
      while (head < tail) {
        const index = queue[head++];
        pixels.data[index * 4 + 3] = 0;
        if (index % sourceW > 0) visit(index - 1);
        if (index % sourceW < sourceW - 1) visit(index + 1);
        visit(index - sourceW); visit(index + sourceW);
      }
      spriteContext.putImageData(pixels, 0, 0);

      // Keep the full soles while excluding the wooden stage from the sprite.
      // The stage begins at source row 309; only the two foot outlines continue below it.
      const character = new Path2D();
      character.rect(0, 0, sourceW, 141);
      character.moveTo(19, 137);
      character.lineTo(39, 137);
      character.lineTo(42, 143);
      character.lineTo(43, 152);
      character.lineTo(15, 152);
      character.lineTo(15, 145);
      character.lineTo(19, 137);
      character.closePath();
      character.moveTo(79, 137);
      character.lineTo(98, 137);
      character.lineTo(98, 141);
      character.lineTo(114, 144);
      character.lineTo(114, 152);
      character.lineTo(77, 152);
      character.lineTo(77, 145);
      character.closePath();
      spriteContext.globalCompositeOperation = "destination-in";
      spriteContext.fill(character);
      spriteContext.globalCompositeOperation = "source-over";

      // Translate intact pixels only. Never separate body parts or rescale the body.
      const poses = new Map<string, HTMLCanvasElement>();
      const key = (pose: Pose) => `${pose.x}:${pose.y}`;
      const makePose = (pose: Pose) => {
        const complete = document.createElement("canvas");
        complete.width = canvas.width; complete.height = canvas.height;
        const completeContext = complete.getContext("2d")!;
        completeContext.imageSmoothingEnabled = false;
        completeContext.drawImage(sprite, 9 + pose.x, 5 + pose.y);
        poses.set(key(pose), complete);
      };
      for (const pose of [rest, { x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, ...profile.attention]) {
        if (!poses.has(key(pose))) makePose(pose);
      }
      const started = performance.now();
      let lastTick = -1;
      let lastPose = "";
      let firstPaint = true;

      paint = (now, force = false) => {
        const currentTick = Math.floor(now / 125);
        if (!force && currentTick === lastTick) return;
        lastTick = currentTick;
        const elapsed = now - reactionStarted;
        const reacting = !motion.matches && elapsed >= 0 && elapsed < profile.duration;
        let pose = rest;
        if (reacting) {
          const index = Math.min(profile.attention.length - 1, Math.floor(elapsed / profile.duration * profile.attention.length));
          pose = profile.attention[index];
        } else if (!motion.matches) {
          const phase = ((now - started + profile.phase) % profile.period) / profile.period;
          // Mostly still, with at most one source pixel of occasional idle motion.
          if (role === "warmup") {
            if (phase > .72 && phase < .84) pose = { x: -1, y: 0 };
          } else if (role !== "footer" && phase > .62 && phase < .76) {
            pose = { x: role === "quiz" ? -1 : 1, y: 0 };
          }
        }
        const mode = motion.matches ? "reduced" : reacting ? "attention" : "quiet";
        const signature = `${mode}:${key(pose)}`;
        if (!force && signature === lastPose) return;
        lastPose = signature;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(poses.get(key(pose))!, 0, 0);
        wrapper.dataset.motion = mode;
        canvas.dataset.pose = key(pose);
        if (firstPaint) { firstPaint = false; setReady(true); }
      };
      loaded = true;
      paint(performance.now(), true);
      schedule();
    };

    // Cards react as a whole; the hero reacts only over the character itself.
    const host = wrapper.closest(".activity-card") ?? wrapper;
    const react = () => {
      if (!loaded || !visible || motion.matches || document.hidden) return;
      const now = performance.now();
      if (now - reactionStarted < 1800) return;
      reactionStarted = now;
      wrapper.dataset.reactions = String(++reactions);
      paint(now, true);
      schedule();
    };
    const onPointerEnter = (event: Event) => {
      if ((event as PointerEvent).pointerType === "mouse") react();
    };
    const onPreferenceChange = () => {
      reactionStarted = -Infinity;
      stop();
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
    host.addEventListener("focusin", react);
    motion.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    observer.observe(wrapper);
    image.src = "./art/dojo-reference.png";

    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      host.removeEventListener("pointerenter", onPointerEnter);
      host.removeEventListener("focusin", react);
      motion.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      image.onload = null;
    };
  }, [role]);

  return <div ref={wrapperRef} className={`arcade-fighter ${className}`} data-ready={ready} data-role={role} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
