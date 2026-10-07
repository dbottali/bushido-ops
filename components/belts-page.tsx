"use client";

import type { MouseEvent, ReactNode, RefObject } from "react";
import { AnimatedFighter } from "@/components/animated-fighter";
import { DojoArt } from "@/components/dojo-art";
import { DojoPageFooter, DojoPageHeader } from "@/components/dojo-page-chrome";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { beltCurriculum, beltQuestions } from "@/lib/belts-content";
import { belts as baseBelts, type BeltId } from "@/lib/dojo-content";
import { courseCatalog, pilotCourse } from "@/lib/course-catalog";
import { completedModules, courseMaxXp, courseStarted, courseXp, nextCourseModule, trainingHref } from "@/lib/course-engine";
import type { DojoProgress } from "@/lib/dojo-progress";
import { useCloud } from "./cloud-provider";
import { previewScore } from "@/lib/guest-preview";

type Props = { brand: ReactNode; headingRef: RefObject<HTMLHeadingElement | null>; belt: BeltId; data: DojoProgress; progressManagement: ReactNode };

function repeatJump(event: MouseEvent<HTMLAnchorElement>, section: "path" | "progress") {
  if (window.location.hash !== `#belts/${section}`) return;
  event.preventDefault();
  document.getElementById(`belts-${section}`)?.scrollIntoView({ block: "start", behavior: "instant" });
  document.getElementById(`belts-${section}-title`)?.focus({ preventScroll: true });
}

export function BeltsPage({ brand, headingRef, belt, data, progressManagement }: Props) {
  const cloud=useCloud();
  const liveWhite=cloud.courses.find(course=>course.belt==="white"&&course.availability==="available"&&course.awardsBelt)??cloud.courses.find(course=>course.belt==="white"&&course.availability==="available");
  const whiteId=liveWhite?.id??pilotCourse.id;
  const belts=baseBelts.map(item=>({...item,available:cloud.courses.length?cloud.courses.some(course=>course.belt===item.id&&course.availability==="available"):item.id==="white"}));
  const completed=cloud.session?(cloud.snapshot?.modules.filter(item=>item.course_id===whiteId&&item.completed).map(item=>item.module_id)??[]):whiteId===pilotCourse.id&&cloud.guest.submitted&&previewScore(cloud.guest)===3?["warmup"]:[];
  const hasStarted=cloud.session?!!cloud.snapshot?.modules.some(item=>item.course_id===whiteId):Object.keys(cloud.guest.answers).length>0;
  const pilotSteps=liveWhite?liveWhite.steps.map((module,index)=>({id:module.id,number:String(index+1).padStart(2,"0"),name:module.title.toUpperCase(),task:module.kind==="lesson"?"Build the habit, then save your lesson completion.":module.kind==="exam"?"Pass the server-checked final exam.":"Practice and check your answers.",condition:module.kind==="lesson"?"Lesson saved to account":"Answers verified by the server",reward:module.reward})):pilotCourse.modules.map((module,index)=>({id:module.id,number:String(index+1).padStart(2,"0"),name:module.title.toUpperCase(),task:module.intro,condition:module.kind==="lesson"?"Free account required":module.kind==="warmup"?"Three preview questions":"Free account required",reward:module.reward}));
  const xp=pilotSteps.reduce((sum,step)=>sum+(completed.includes(step.id)?step.reward:0),0);
  const totalXp=pilotSteps.reduce((sum,step)=>sum+step.reward,0);
  const completedCount = completed.length;
  const pilotComplete = completedCount === pilotSteps.length;
  const nextStep=pilotSteps.find(step=>!completed.includes(step.id))??pilotSteps[0];
  const practiceHref=cloud.session?trainingHref(whiteId,nextStep?.id):cloud.guest.submitted?"#account/signup":"#dojo";
  const practiceLabel = pilotComplete ? "REVISIT WHITE BELT" : hasStarted ? "CONTINUE YOUR PRACTICE" : "START WHITE BELT";
  const readyBelts = belts.filter(item => item.available).length;

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
          <div className="belts-current-body"><AnimatedFighter role="training" className="belts-current-fighter" /><div><strong>PAUSE.<br />VERIFY.<br />PROTECT.</strong><p>Try three questions.<br />Free account to continue.</p></div></div>
          <div className="belts-current-progress"><div><span>{pilotComplete ? "PILOT COMPLETE" : `${completedCount} / ${pilotSteps.length} MODULES COMPLETE`}</span><strong>{xp} / {totalXp} XP</strong></div><Progress value={xp / totalXp * 100} aria-label="White Belt pilot completion" aria-valuetext={`${xp} of ${totalXp} XP, ${completedCount} of ${pilotSteps.length} modules complete`} /><a href="#belts/progress" onClick={event => repeatJump(event, "progress")}>VIEW YOUR PRACTICE <span aria-hidden="true">➜</span></a></div>
        </aside>
      </section>

      <div className="belts-path-summary" aria-label="Current curriculum availability"><span><strong>{String(readyBelts).padStart(2, "0")}</strong> BELT PRACTICE READY</span><span><strong>{String(belts.length - readyBelts).padStart(2, "0")}</strong> BELTS IN DEVELOPMENT</span><span><strong>{totalXp}</strong> PILOT XP</span></div>

      <section id="belts-path" className="belts-path-section" aria-labelledby="belts-path-title">
        <div className="belts-section-title"><p className="eyebrow">THE BELT PATH</p><h2 id="belts-path-title" tabIndex={-1}>EVERY STEP BUILDS ON THE LAST.</h2><p>Choose a belt to explore its focus, skills and practice mission.</p></div>
        <Tabs value={belt} onValueChange={value => { window.location.hash = `belts/${value}`; }} className="belts-tabs">
          <TabsList aria-label="Explore the eight belts">{belts.map((item, index) => <TabsTrigger key={item.id} value={item.id} data-belt-id={item.id} aria-label={`${item.name} belt. ${item.available ? "Pilot available" : "Planned curriculum"}`}><span className="belts-tab-number">0{index + 1}</span><span className="belts-tab-art"><DojoArt x={item.x} y={637} w={76} h={73} /><DojoArt x={item.x + 76} y={651} w={57} h={44} /></span><span className="belts-tab-copy"><strong>{item.name.toUpperCase()}</strong><small>{item.available ? "PRACTICE READY" : "PLANNED"}</small></span></TabsTrigger>)}</TabsList>
          {belts.map((item, index) => {
            const curriculum = beltCurriculum[item.id];
            const beltCourse = cloud.courses.find(course=>course.belt===item.id&&course.availability==="available"&&course.awardsBelt)??cloud.courses.find(course=>course.belt===item.id&&course.availability==="available");
            const beltHref = beltCourse ? beltCourse.access==="open"?trainingHref(beltCourse.id):item.id==="white"?practiceHref:"#account" : practiceHref;
            return <TabsContent key={item.id} value={item.id}><div className="belts-detail pixel-frame">
              <article className="belts-detail-copy"><div className="belts-detail-label"><p className="eyebrow">0{index + 1} / {item.name.toUpperCase()} BELT</p><span className={`belts-availability ${item.available ? "available" : ""}`}>{item.available ? "PRACTICE AVAILABLE" : "IN DEVELOPMENT"}</span></div><h3>{item.topic}</h3><p className="belts-focus">{curriculum.focus}</p><p>{item.description}</p><h4>{item.available ? "IN THIS FIRST PRACTICE" : "PLANNED LEARNING OUTCOMES"}</h4><ul>{curriculum.outcomes.map(outcome => <li key={outcome}><span aria-hidden="true">▪</span>{outcome}</li>)}</ul><div className="belts-detail-action"><a href={beltHref} className="pixel-button">{item.available ? item.id === "white" ? practiceLabel : "OPEN BELT PRACTICE" : "TRAIN WHITE BELT"} <span aria-hidden="true">➜</span></a><p>{item.available ? `${beltCourse?.moduleCount ?? 3} steps. ${item.id === "white" ? "Free account to continue." : "Subscription and prerequisites required."}` : "This curriculum is being developed. Your first practice is ready at White Belt."}</p></div></article>
              <aside className="belts-mission"><div className="belts-mission-top"><p className="eyebrow">{item.available ? "YOUR FIRST MISSION" : "PLANNED PRACTICE"}</p><DojoArt x={item.x + 76} y={651} w={57} h={44} /></div><h4>{curriculum.mission}</h4><p>{curriculum.situation}</p><details className="belts-next-move" key={item.id}><summary>{item.available ? "REVEAL THE FIRST MOVE" : "EXPLORE THE APPROACH"}<span className="philosophy-disclosure-marker" aria-hidden="true" /></summary><p>{curriculum.nextMove}</p></details><span className="belts-mission-note">{item.available ? "Try this situation in the live Warm-up." : "Curriculum preview / exercise not yet playable"}</span></aside>
            </div></TabsContent>;
          })}
        </Tabs>
      </section>

      <section id="belts-progress" className="belts-progress pixel-frame" aria-labelledby="belts-progress-title">
        <div className="belts-progress-heading"><div><p className="eyebrow">WHITE BELT / YOUR PROGRESS</p><h2 id="belts-progress-title" tabIndex={-1}>{pilotComplete ? "FIRST PRACTICE COMPLETE." : "YOUR STEPS. ONE USEFUL HABIT."}</h2><p>{pilotComplete ? "You practiced pausing, verifying and protecting. Revisit any step when you want another round." : "Work through the first practice at your own pace. Try the preview as a guest; create a free account to save course progress across devices."}</p></div><div className="belts-progress-total"><strong>{xp} / {totalXp} XP</strong><span>{completedCount} / {pilotSteps.length} complete</span></div></div>
        <Progress value={xp / totalXp * 100} aria-label="White Belt saved progress XP" aria-valuetext={`${xp} of ${totalXp} XP`} />
        <ol className="belts-pilot-steps">{pilotSteps.map(step => {
          const done = completed.includes(step.id);
          return <li key={step.id}><a href={cloud.session ? trainingHref(whiteId, step.id) : step.id === "warmup" ? "#dojo" : "#account/signup"} className={done ? "complete" : ""}><div><span className="belts-step-number">{step.number}</span><span className="belts-step-status">{done ? "COMPLETE ✓" : "READY TO PRACTICE"}</span></div><h3>{step.name}</h3><p>{step.task}</p><small>{step.condition}</small><span className="belts-step-reward"><strong>{done ? "EARNED" : "REWARD"} / {step.reward} XP</strong><span aria-hidden="true">➜</span></span></a></li>;
        })}</ol>
        <p className="belts-progress-note">Rewards count once per module. Guest preview XP is provisional until the server checks your answers. {liveWhite?.awardsBelt ? "Pass every step and the final exam to earn White." : "This is a pilot; the full White belt curriculum is still in development."}</p>
        {progressManagement}
      </section>

      <section className="belts-code" aria-labelledby="belts-code-title"><div><p className="eyebrow">THE WAY YOU TRAIN MATTERS</p><h2 id="belts-code-title">ORDER. RESPECT. HONOR.</h2><p>Progress starts with a clear mind, care for others and the patience to try again. Carry the dojo code into every belt.</p></div><a href="#philosophy" className="pixel-button pixel-button-light">READ THE DOJO CODE <span aria-hidden="true">➜</span></a></section>

      <section className="belts-faq" aria-labelledby="belts-faq-title"><div className="belts-section-title"><p className="eyebrow">BEFORE THE NEXT STEP</p><h2 id="belts-faq-title">A CLEAR PATH. CLEAR EXPECTATIONS.</h2></div>{beltQuestions.map(item => <details key={item.question} className="about-question"><summary>{item.question}<span className="philosophy-disclosure-marker" aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</section>
      <section className="belts-start pixel-frame" aria-labelledby="belts-start-title"><div><p className="eyebrow">ONE STEP IS ENOUGH TO BEGIN</p><h2 id="belts-start-title">BRING CURIOSITY. BUILD A HABIT.</h2><p>Your White Belt practice is ready when you are.</p></div><a href={practiceHref} className="pixel-button">{practiceLabel} <span aria-hidden="true">➜</span></a></section>
    </main>
    <DojoPageFooter />
  </div>;
}
