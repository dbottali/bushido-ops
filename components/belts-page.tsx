"use client";

import type { MouseEvent, ReactNode, RefObject } from "react";
import { AnimatedFighter } from "@/components/animated-fighter";
import { DojoArt } from "@/components/dojo-art";
import { DojoPageFooter, DojoPageHeader } from "@/components/dojo-page-chrome";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { beltCurriculum, beltQuestions, pilotSteps } from "@/lib/belts-content";
import { belts, earnedXp, rewards, type BeltId, type ModuleId } from "@/lib/dojo-content";

type Props = { brand: ReactNode; headingRef: RefObject<HTMLHeadingElement | null>; belt: BeltId; completed: ModuleId[]; hasStarted: boolean; progressManagement: ReactNode };

function repeatJump(event: MouseEvent<HTMLAnchorElement>, section: "path" | "progress") {
  if (window.location.hash !== `#belts/${section}`) return;
  event.preventDefault();
  document.getElementById(`belts-${section}`)?.scrollIntoView({ block: "start", behavior: "instant" });
  document.getElementById(`belts-${section}-title`)?.focus({ preventScroll: true });
}

export function BeltsPage({ brand, headingRef, belt, completed, hasStarted, progressManagement }: Props) {
  const xp = earnedXp(completed);
  const totalXp = pilotSteps.reduce((total, step) => total + rewards[step.id], 0);
  const completedCount = pilotSteps.filter(step => completed.includes(step.id)).length;
  const pilotComplete = completedCount === pilotSteps.length;
  const nextStep = pilotSteps.find(step => !completed.includes(step.id));
  const practiceHref = `#dojo/${nextStep?.id ?? "warmup"}`;
  const practiceLabel = pilotComplete ? "REVISIT WHITE BELT" : hasStarted ? "CONTINUE YOUR PRACTICE" : "START WHITE BELT";

  return <div className="dojo-page-shell belts-shell">
    <DojoPageHeader brand={brand} currentPage="belts" />
    <main id="belts-content" tabIndex={-1} className="belts-main">
      <section className="belts-intro" aria-labelledby="belts-title">
        <div className="belts-intro-copy">
          <p className="eyebrow">BELTS / YOUR TRAINING PATH</p>
          <h1 id="belts-title" ref={headingRef} tabIndex={-1}><span>ONE PATH.</span><span>EIGHT BELTS.</span></h1>
          <p className="belts-lead">A useful habit is your first win.</p>
          <p>Begin with everyday digital self-defense. Explore the skills ahead, practice one idea at a time and give every step a purpose.</p>
          <div className="belts-intro-actions"><a href={practiceHref} className="pixel-button">{practiceLabel} <span aria-hidden="true">➜</span></a><a href="#belts/path" className="about-text-link" onClick={event => repeatJump(event, "path")}>EXPLORE THE PATH <span aria-hidden="true">↓</span></a></div>
        </div>
        <aside className="belts-current pixel-frame" aria-label="Current White Belt pilot progress">
          <div className="belts-current-heading"><div><p className="eyebrow">AVAILABLE NOW</p><h2>WHITE BELT</h2><p>Phishing awareness / first practice</p></div><DojoArt x={233} y={651} w={57} h={44} className="belts-current-symbol" /></div>
          <div className="belts-current-body"><AnimatedFighter role="training" className="belts-current-fighter" /><div><strong>PAUSE.<br />VERIFY.<br />PROTECT.</strong><p>No signup.<br />Start where you are.</p></div></div>
          <div className="belts-current-progress"><div><span>{pilotComplete ? "PILOT COMPLETE" : `${completedCount} / ${pilotSteps.length} MODULES COMPLETE`}</span><strong>{xp} / {totalXp} XP</strong></div><Progress value={xp / totalXp * 100} aria-label="White Belt pilot completion" aria-valuetext={`${xp} of ${totalXp} XP, ${completedCount} of ${pilotSteps.length} modules complete`} /><a href="#belts/progress" onClick={event => repeatJump(event, "progress")}>VIEW YOUR PRACTICE <span aria-hidden="true">➜</span></a></div>
        </aside>
      </section>

      <div className="belts-path-summary" aria-label="Current curriculum availability"><span><strong>01</strong> PILOT READY</span><span><strong>07</strong> BELTS IN DEVELOPMENT</span><span><strong>{totalXp}</strong> PILOT XP</span></div>

      <section id="belts-path" className="belts-path-section" aria-labelledby="belts-path-title">
        <div className="belts-section-title"><p className="eyebrow">THE BELT PATH</p><h2 id="belts-path-title" tabIndex={-1}>EVERY STEP BUILDS ON THE LAST.</h2><p>Choose a belt to explore its focus, skills and practice mission.</p></div>
        <Tabs value={belt} onValueChange={value => { window.location.hash = `belts/${value}`; }} className="belts-tabs">
          <TabsList aria-label="Explore the eight belts">{belts.map((item, index) => <TabsTrigger key={item.id} value={item.id} data-belt-id={item.id} aria-label={`${item.name} belt. ${item.available ? "Pilot available" : "Planned curriculum"}`}><span className="belts-tab-number">0{index + 1}</span><span className="belts-tab-art"><DojoArt x={item.x} y={637} w={76} h={73} /><DojoArt x={item.x + 76} y={651} w={57} h={44} /></span><span className="belts-tab-copy"><strong>{item.name.toUpperCase()}</strong><small>{item.available ? "PILOT READY" : "PLANNED"}</small></span></TabsTrigger>)}</TabsList>
          {belts.map((item, index) => {
            const curriculum = beltCurriculum[item.id];
            return <TabsContent key={item.id} value={item.id}><div className="belts-detail pixel-frame">
              <article className="belts-detail-copy"><div className="belts-detail-label"><p className="eyebrow">0{index + 1} / {item.name.toUpperCase()} BELT</p><span className={`belts-availability ${item.available ? "available" : ""}`}>{item.available ? "PILOT AVAILABLE" : "IN DEVELOPMENT"}</span></div><h3>{item.topic}</h3><p className="belts-focus">{curriculum.focus}</p><p>{item.description}</p><h4>{item.available ? "IN THIS FIRST PRACTICE" : "PLANNED LEARNING OUTCOMES"}</h4><ul>{curriculum.outcomes.map(outcome => <li key={outcome}><span aria-hidden="true">▪</span>{outcome}</li>)}</ul><div className="belts-detail-action"><a href={practiceHref} className="pixel-button">{item.available ? practiceLabel : "TRAIN WHITE BELT"} <span aria-hidden="true">➜</span></a><p>{item.available ? "Three modules. One habit to take with you." : "This curriculum is being developed. Your first practice is ready at White Belt."}</p></div></article>
              <aside className="belts-mission"><div className="belts-mission-top"><p className="eyebrow">{item.available ? "YOUR FIRST MISSION" : "PLANNED PRACTICE"}</p><DojoArt x={item.x + 76} y={651} w={57} h={44} /></div><h4>{curriculum.mission}</h4><p>{curriculum.situation}</p><details className="belts-next-move" key={item.id}><summary>{item.available ? "REVEAL THE FIRST MOVE" : "EXPLORE THE APPROACH"}<span className="philosophy-disclosure-marker" aria-hidden="true" /></summary><p>{curriculum.nextMove}</p></details><span className="belts-mission-note">{item.available ? "Try this situation in the live Warm-up." : "Curriculum preview / exercise not yet playable"}</span></aside>
            </div></TabsContent>;
          })}
        </Tabs>
      </section>

      <section id="belts-progress" className="belts-progress pixel-frame" aria-labelledby="belts-progress-title">
        <div className="belts-progress-heading"><div><p className="eyebrow">WHITE BELT / YOUR PROGRESS</p><h2 id="belts-progress-title" tabIndex={-1}>{pilotComplete ? "FIRST PRACTICE COMPLETE." : "THREE STEPS. ONE USEFUL HABIT."}</h2><p>{pilotComplete ? "You practiced pausing, verifying and protecting. Revisit any step when you want another round." : "Work through the first practice at your own pace. Your progress follows you around the dojo and is saved on this browser when storage is available."}</p></div><div className="belts-progress-total"><strong>{xp} / {totalXp} XP</strong><span>{completedCount} / {pilotSteps.length} complete</span></div></div>
        <Progress value={xp / totalXp * 100} aria-label="White Belt saved progress XP" aria-valuetext={`${xp} of ${totalXp} XP`} />
        <ol className="belts-pilot-steps">{pilotSteps.map(step => {
          const done = completed.includes(step.id);
          return <li key={step.id}><a href={`#dojo/${step.id}`} className={done ? "complete" : ""}><div><span className="belts-step-number">{step.number}</span><span className="belts-step-status">{done ? "COMPLETE ✓" : "READY TO PRACTICE"}</span></div><h3>{step.name}</h3><p>{step.task}</p><small>{step.condition}</small><span className="belts-step-reward"><strong>{done ? "EARNED" : "REWARD"} / {rewards[step.id]} XP</strong><span aria-hidden="true">➜</span></span></a></li>;
        })}</ol>
        <p className="belts-progress-note">Rewards count once per module. Your progress survives reloads when this browser allows saving. {totalXp} XP completes the pilot; the full belt curriculum is still in development.</p>
        {progressManagement}
      </section>

      <section className="belts-code" aria-labelledby="belts-code-title"><div><p className="eyebrow">THE WAY YOU TRAIN MATTERS</p><h2 id="belts-code-title">ORDER. RESPECT. HONOR.</h2><p>Progress starts with a clear mind, care for others and the patience to try again. Carry the dojo code into every belt.</p></div><a href="#philosophy" className="pixel-button pixel-button-light">READ THE DOJO CODE <span aria-hidden="true">➜</span></a></section>

      <section className="belts-faq" aria-labelledby="belts-faq-title"><div className="belts-section-title"><p className="eyebrow">BEFORE THE NEXT STEP</p><h2 id="belts-faq-title">A CLEAR PATH. CLEAR EXPECTATIONS.</h2></div>{beltQuestions.map(item => <details key={item.question} className="about-question"><summary>{item.question}<span className="philosophy-disclosure-marker" aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</section>
      <section className="belts-start pixel-frame" aria-labelledby="belts-start-title"><div><p className="eyebrow">ONE STEP IS ENOUGH TO BEGIN</p><h2 id="belts-start-title">BRING CURIOSITY. BUILD A HABIT.</h2><p>Your White Belt practice is ready when you are.</p></div><a href={practiceHref} className="pixel-button">{practiceLabel} <span aria-hidden="true">➜</span></a></section>
    </main>
    <DojoPageFooter />
  </div>;
}
