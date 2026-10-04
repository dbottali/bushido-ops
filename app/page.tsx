"use client";

import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { DojoArt } from "@/components/dojo-art";
import { AnimatedFighter } from "@/components/animated-fighter";
import { PhilosophyPage } from "@/components/philosophy-page";
import { AboutPage } from "@/components/about-page";
import { BeltsPage } from "@/components/belts-page";
import { MyDojoPage } from "@/components/my-dojo-page";
import { CoursePlayer } from "@/components/course-player";
import { DojoPageHeader } from "@/components/dojo-page-chrome";
import { ProgressManager } from "@/components/progress-manager";
import { useDojoProgress } from "@/components/use-dojo-progress";
import { courseCatalog, pilotCourse, PILOT_ID } from "@/lib/course-catalog";
import { completedModules, courseStarted, courseStatus, learningSummary, trainingHref } from "@/lib/course-engine";
import { resolveTrainingRoute, type TrainingRoute } from "@/lib/dojo-routes";
import { isPrincipleId, principles, type PrincipleId } from "@/lib/philosophy-content";
import { belts, isBeltId, type BeltId, type ModuleId } from "@/lib/dojo-content";

type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: object; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => unknown };

function PixelButton({ children, href, light = false, className = "" }: {
  children: React.ReactNode; href: string; light?: boolean; className?: string;
}) {
  return <a className={`pixel-button ${light ? "pixel-button-light" : ""} ${className}`} href={href}>{children}</a>;
}
function Brand() {
  return <a href="#" className="brand" aria-label="Bushido Ops home"><DojoArt x={197} y={10} w={58} h={55} className="brand-mark" /><span><strong>BUSHIDO OPS</strong><small lang="ja">デジタル道場</small></span></a>;
}
type View = "home" | "dojo" | "my-dojo" | "philosophy" | "about" | "belts";
export default function Home() {
  const { store, snapshot } = useDojoProgress();
  const { commitments } = snapshot.data;
  const [view, setView] = useState<View>("home");
  const currentView = useRef(view);
  const [principle, setPrinciple] = useState<PrincipleId>("order");
  const [aboutModule, setAboutModule] = useState<ModuleId>("warmup");
  const [trainingRoute, setTrainingRoute] = useState<TrainingRoute>({ courseId: PILOT_ID, moduleId: "warmup" });
  const [activeBelt, setActiveBelt] = useState<BeltId>("white");
  const heading = useRef<HTMLHeadingElement>(null);
  const summary = learningSummary(snapshot.data, courseCatalog);
  const hasStarted = courseCatalog.courses.some(course => courseStarted(snapshot.data, course));
  const allComplete = summary.availableCourses > 0 && summary.completedCourses === summary.availableCourses;
  const dojoLabel = allComplete ? "REVISIT THE DOJO" : hasStarted ? "CONTINUE TRAINING" : "ENTER THE DOJO";

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash;
      const training = hash === "#dojo" || hash.startsWith("#dojo/") || hash === "#training-content";
      const myDojo = hash === "#my-dojo" || hash.startsWith("#my-dojo/") || hash === "#my-dojo-content" || hash === "#progress";
      const philosophy = hash === "#philosophy" || hash.startsWith("#philosophy/") || hash === "#philosophy-content";
      const about = hash === "#about" || hash.startsWith("#about/") || hash === "#about-content";
      const beltPage = hash === "#belts" || hash.startsWith("#belts/") || hash === "#belts-content";
      const nextView: View = training ? "dojo" : myDojo ? "my-dojo" : philosophy ? "philosophy" : about ? "about" : beltPage ? "belts" : "home";
      const enteringView = currentView.current !== nextView;
      const keepTabFocus = !enteringView && document.activeElement?.getAttribute("role") === "tab";
      currentView.current = nextView;
      setView(nextView);
      const module = hash.split("/")[1];
      if (training && (hash !== "#training-content" || enteringView)) setTrainingRoute(resolveTrainingRoute(hash, store.getSnapshot().data));
      if (philosophy && isPrincipleId(module)) setPrinciple(module);
      else if (hash === "#philosophy") setPrinciple("order");
      if (about && ["warmup", "lesson", "quiz"].includes(module)) setAboutModule(module as ModuleId);
      else if (hash === "#about") setAboutModule("warmup");
      if (beltPage && isBeltId(module)) setActiveBelt(module);
      else if (beltPage && module !== "path" && module !== "progress" && hash !== "#belts-content") setActiveBelt("white");
      // Wait for React to mount a different view before moving focus or scrolling.
      requestAnimationFrame(() => {
        if (["#training-content", "#philosophy-content", "#about-content", "#belts-content", "#my-dojo-content"].includes(hash)) {
          const target = document.getElementById(hash.slice(1));
          target?.scrollIntoView({ block: "start", behavior: "instant" }); target?.focus({ preventScroll: true });
        } else if (myDojo && (module === "backups" || hash === "#progress")) {
          document.getElementById("my-dojo-backups")?.scrollIntoView({ block: "start", behavior: "instant" });
          document.getElementById("my-dojo-backups-title")?.focus({ preventScroll: true });
        } else if (philosophy && module === "code") {
          document.getElementById("philosophy-code")?.scrollIntoView({ block: "start", behavior: "instant" });
          document.getElementById("philosophy-code-title")?.focus({ preventScroll: true });
        } else if (about && module === "how") {
          document.getElementById("about-how")?.scrollIntoView({ block: "start", behavior: "instant" });
          document.getElementById("about-how-title")?.focus({ preventScroll: true });
        } else if (beltPage && (module === "path" || module === "progress")) {
          document.getElementById(`belts-${module}`)?.scrollIntoView({ block: "start", behavior: "instant" });
          document.getElementById(`belts-${module}-title`)?.focus({ preventScroll: true });
        } else if (beltPage && isBeltId(module) && enteringView) {
          document.getElementById("belts-path")?.scrollIntoView({ block: "start", behavior: "instant" });
          document.querySelector<HTMLElement>(`[data-belt-id="${module}"]`)?.focus({ preventScroll: true });
        } else if (enteringView || (training && !keepTabFocus)) {
          window.scrollTo({ top: 0, behavior: "instant" }); heading.current?.focus({ preventScroll: true });
        }
        if (!training && !myDojo && !philosophy && !about && !beltPage && hash && hash !== "#") document.getElementById(hash.slice(1))?.scrollIntoView({ block: "center", behavior: enteringView ? "instant" : "smooth" });
      });
    };
    readHash(); window.addEventListener("hashchange", readHash);
    // Clicking an already-current hash does not emit hashchange.
    const repeatHash = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || anchor.getAttribute("href") !== window.location.hash) return;
      event.preventDefault(); readHash();
    };
    document.addEventListener("click", repeatHash);
    return () => { window.removeEventListener("hashchange", readHash); document.removeEventListener("click", repeatHash); };
  }, [store]);

  useEffect(() => {
    const name = view === "my-dojo" ? "My Dojo" : view === "belts" ? "Belts" : view === "about" ? "About" : view === "philosophy" ? "Philosophy" : view === "dojo" ? courseCatalog.courses.find(course => course.id === trainingRoute.courseId)?.title ?? "Training" : "";
    document.title = name ? `${name} | Bushido Ops` : "Bushido Ops | Digital self-defense for everyone";
  }, [view, trainingRoute.courseId]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const agentTools = [
      { name: "read_training_progress", title: "Read dojo progress", description: "Read course states, completed steps, XP and browser-local saving status.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: () => { const current = store.getSnapshot(); return { ...learningSummary(current.data, courseCatalog), courses: courseCatalog.courses.map(course => ({ id: course.id, status: courseStatus(current.data, course, courseCatalog), completed: completedModules(current.data, course) })), persistence: current.mode === "saved" ? "browser-local" : current.mode === "protected" ? "protected-copy" : "temporary-session" }; } },
      { name: "open_training_module", title: "Open a training module", description: "Navigate to a pilot warm-up, lesson, or quiz. This does not complete training or award XP.", inputSchema: { type: "object", properties: { module: { type: "string", enum: ["warmup", "lesson", "quiz"] } }, required: ["module"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: (input: unknown) => {
        if (!input || typeof input !== "object" || !("module" in input) || !["warmup", "lesson", "quiz"].includes(String(input.module))) throw new Error("Choose warmup, lesson, or quiz.");
        window.location.hash = trainingHref(pilotCourse.id, String(input.module));
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve({ opened: input.module }))));
      } },
    ];
    for (const tool of agentTools) { try { void Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch(() => {}); } catch { /* Unsupported registration does not block training. */ } }
    return () => controller.abort();
  }, [store]);

  if (!snapshot.ready) return <main className="progress-loading" aria-busy="true"><Brand /><p role="status">OPENING YOUR DOJO…</p></main>;
  const skipTarget = view === "home" ? "#main" : view === "my-dojo" ? "#my-dojo-content" : view === "belts" ? "#belts-content" : view === "about" ? "#about-content" : view === "philosophy" ? "#philosophy-content" : "#training-content";
  return <>
    <a className="skip-link" href={skipTarget}>Skip to content</a>
    {snapshot.notice && <div className="progress-notice" role="status"><p>{snapshot.notice}</p><a href="#my-dojo/backups">MANAGE YOUR PROGRESS <span aria-hidden="true">➜</span></a></div>}
    {view === "home" ? <div className="home-shell">
      <div className="home-header-wrap"><DojoPageHeader brand={<Brand />} currentPage="home" /></div>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <DojoArt x={0} y={74} w={199} h={292} className="hero-lantern" /><DojoArt x={199} y={91} w={49} h={101} className="hero-seal" /><div className="hero-scene"><DojoArt x={716} y={74} w={956} h={292} /><DojoArt x={716} y={74} w={956} h={292} source="./art/dojo-background-clean.png" className="hero-clean-scene" /><AnimatedFighter className="hero-fighter" role="hero" /></div>
          <div className="hero-copy"><h1 id="hero-title"><span className="sr-only">DIGITAL SELF-DEFENSE FOR EVERYONE</span><DojoArt x={270} y={92} w={447} h={155} className="hero-lettering" /></h1><h2>Cybersecurity training without gatekeeping.</h2><p>Bushido Ops is an anti-gatekeeping cybersecurity dojo.<br className="desktop-break" />We teach practical self-defense from complete beginner<br className="desktop-break" />upward—one step at a time. Just practical skills.</p><div className="hero-actions"><PixelButton href="#dojo">{dojoLabel} <span aria-hidden="true">➜</span></PixelButton><PixelButton light href="#belts">VIEW THE BELTS <span aria-hidden="true">➜</span></PixelButton></div></div>
        </section>
        <section className="activity-cards content-width" aria-label="How to train">{[
          { id: "warmup", title: "WARM-UP", copy: <>Sharpen your awareness<br />with quick wins.</>, icon: [166, 389, 44, 39], art: [360, 402, 232, 96] },
          { id: "lesson", title: "LESSON", copy: <>Bite-sized lessons.<br />Real-world skills.</>, icon: [633, 389, 51, 40], art: [822, 390, 212, 114] },
          { id: "quiz", title: "QUIZ", copy: <>Test your knowledge.<br />Level up.</>, icon: [1067, 389, 47, 41], art: [1258, 399, 247, 105] },
        ].map(card => <a key={card.id} href={`#dojo/${card.id}`} className={`activity-card pixel-frame card-${card.id}`}><div className="card-heading"><DojoArt x={card.icon[0]} y={card.icon[1]} w={card.icon[2]} h={card.icon[3]} /><h2>{card.title}</h2></div><p>{card.copy}</p><div className="card-art"><DojoArt x={card.art[0]} y={card.art[1]} w={card.art[2]} h={card.art[3]} source={card.id === "lesson" ? "./art/dojo-reference.png" : "./art/dojo-background-clean.png"} />{card.id !== "lesson" && <AnimatedFighter className="card-fighter" role={card.id === "warmup" ? "warmup" : "quiz"} />}</div><span className="card-track" aria-hidden="true">▪ — — ▪ ···················</span></a>)}</section>
        <section className="why-section content-width" id="why-bushido-ops" aria-labelledby="why-title"><h2 className="section-heading" id="why-title"><span>WHY BUSHIDO OPS</span></h2><div className="values-grid">
          <div><DojoArt x={195} y={546} w={62} h={65} /><article><h3>ANTI-GATEKEEPING LEARNING</h3><p>No elitism. No jargon. Just clear,<br />welcoming training for all.</p></article></div>
          <div><DojoArt x={629} y={550} w={57} h={61} /><article><h3>PRACTICAL DIGITAL SELF-DEFENSE</h3><p>Real skills for real threats.<br />Use it. Apply it. Defend yourself.</p></article></div>
          <div><DojoArt x={1093} y={556} w={66} h={57} /><article><h3>STEADY, BELT-BASED PROGRESS</h3><p>Clear path. Visible progress.<br />Earn your belt. Keep growing.</p></article></div>
        </div></section>
        <section className="belt-section content-width" id="home-belt-path" aria-labelledby="belt-title"><h2 className="section-heading" id="belt-title"><span>THE BELT PATH</span></h2><div className="belt-path">{belts.map((belt, i) => <a key={belt.id} className="belt-step" href={`#belts/${belt.id}`} aria-label={`Explore the ${belt.name.toLowerCase()} belt`} style={{ "--idle-delay": `${i * -0.71}s`, "--idle-period": `${5.2 + (i % 3) * 0.9}s` } as React.CSSProperties}><div className="belt-art"><DojoArt x={belt.x} y={637} w={76} h={73} className="belt-character" /><DojoArt x={belt.x + 76} y={651} w={57} h={44} className="belt-symbol" /></div><strong>{belt.name.toUpperCase()}</strong></a>)}</div></section>
        <section className="principles content-width" aria-label="Bushido principles">{principles.map(p => <a key={p.id} href={`#philosophy/${p.id}`} aria-label={`Explore ${p.name.toLowerCase()}`}><DojoArt x={p.icon.x} y={738} w={p.icon.w} h={61} /><article><h3>{p.name}</h3><p>{p.homeCopy[0]}<br />{p.homeCopy[1]}</p></article></a>)}</section>
      </main>
      <footer className="journey-footer"><div className="footer-left"><DojoArt x={0} y={810} w={343} h={131} /><DojoArt x={0} y={810} w={343} h={131} source="./art/dojo-background-clean.png" className="footer-clean-scene" /><AnimatedFighter className="footer-fighter" role="footer" /></div><DojoArt x={1415} y={810} w={257} h={131} className="footer-right" /><div className="footer-message"><h2><span className="sr-only">READY TO BEGIN YOUR JOURNEY?</span><DojoArt x={358} y={830} w={563} h={39} className="footer-lettering" /></h2><p>Step onto the path. Train with purpose. Earn your belt.</p><div className="footer-progress"><span>YOUR PRACTICE</span><Progress value={summary.maxXp ? summary.xp / summary.maxXp * 100 : 0} aria-label="Available training progress" /><span>{summary.xp} / {summary.maxXp} XP</span></div></div><div className="footer-action"><PixelButton href="#dojo">{dojoLabel} <span aria-hidden="true">➜</span></PixelButton><p>No signup. No gatekeeping. Just training.</p><a className="footer-progress-link" href="#my-dojo">MY DOJO <span aria-hidden="true">➜</span></a></div></footer>
    </div> : view === "my-dojo" ? <MyDojoPage brand={<Brand />} headingRef={heading} store={store} snapshot={snapshot} /> : view === "belts" ? <BeltsPage brand={<Brand />} headingRef={heading} belt={activeBelt} data={snapshot.data} progressManagement={<ProgressManager store={store} snapshot={snapshot} />} /> : view === "about" ? <AboutPage brand={<Brand />} headingRef={heading} module={aboutModule} /> : view === "philosophy" ? <PhilosophyPage brand={<Brand />} headingRef={heading} principle={principle} commitments={commitments} onToggleCommitment={id => store.dispatch({ type: "toggle-habit", id })} /> : <CoursePlayer brand={<Brand />} headingRef={heading} route={trainingRoute} store={store} snapshot={snapshot} />}
  </>;
}
