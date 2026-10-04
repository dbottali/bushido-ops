"use client";

import type { ReactNode, RefObject } from "react";
import { AnimatedFighter } from "@/components/animated-fighter";
import { DojoArt } from "@/components/dojo-art";
import { DojoPageFooter, DojoPageHeader } from "@/components/dojo-page-chrome";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aboutLearners, aboutModules, aboutQuestions } from "@/lib/about-content";
import { belts, rewards, type ModuleId } from "@/lib/dojo-content";

type Props = { brand: ReactNode; headingRef: RefObject<HTMLHeadingElement | null>; module: ModuleId };

export function AboutPage({ brand, headingRef, module }: Props) {
  return <div className="dojo-page-shell about-shell">
    <DojoPageHeader brand={brand} currentPage="about" />
    <main id="about-content" tabIndex={-1} className="about-main">
      <section className="about-intro" aria-labelledby="about-title">
        <div>
          <p className="eyebrow">ABOUT / THE DIGITAL DOJO</p>
          <h1 id="about-title" ref={headingRef} tabIndex={-1}><span>CYBERSECURITY</span><span>IS FOR EVERYONE.</span></h1>
          <p className="about-lead">A digital dojo for everyday self-defense.</p>
          <p>Bushido Ops makes security practice approachable. Start with a situation you recognize, understand your options and build a habit you can use beyond the screen.</p>
          <div className="about-intro-actions"><a href="#dojo/warmup" className="pixel-button">START WHITE BELT <span aria-hidden="true">➜</span></a><a href="#about/how" className="about-text-link" onClick={event => {
            if (window.location.hash !== "#about/how") return;
            event.preventDefault();
            document.getElementById("about-how")?.scrollIntoView({ block: "start", behavior: "instant" });
            document.getElementById("about-how-title")?.focus({ preventScroll: true });
          }}>SEE HOW IT WORKS <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className="about-dojo pixel-frame"><div className="about-stage"><DojoArt x={716} y={74} w={956} h={292} /><DojoArt x={716} y={74} w={956} h={292} source="./art/dojo-background-clean.png" className="hero-clean-scene" /><AnimatedFighter className="hero-fighter" role="hero" /></div><div className="about-dojo-caption"><span className="eyebrow">YOUR FIRST STEP</span><strong>A BEGINNER’S MIND.<br />A USEFUL HABIT.</strong><span>No signup. Start where you are.</span></div></div>
      </section>

      <section className="about-mission" aria-labelledby="about-mission-title"><div><p className="eyebrow">WHY THIS DOJO EXISTS</p><h2 id="about-mission-title">NO GATEKEEPING.<br />ROOM TO GROW.</h2></div><p>You should be able to ask a basic question without feeling out of place. Bushido Ops brings the learning back to clear explanations, practical decisions and steady repetition. Curiosity is enough to take the first step.</p></section>

      <section className="about-audience" aria-labelledby="about-audience-title"><h2 id="about-audience-title" className="sr-only">Who the dojo is for</h2>{aboutLearners.map(item => <article key={item.title} className="pixel-frame"><DojoArt {...item.icon} /><h3>{item.title}</h3><p>{item.copy}</p></article>)}</section>

      <section className="about-how" id="about-how" aria-labelledby="about-how-title">
        <div className="about-section-title"><p className="eyebrow">THE TRAINING LOOP</p><h2 id="about-how-title" tabIndex={-1}>ONE SESSION. THREE STEPS.</h2><p>Explore each step, then try it in the White Belt pilot.</p></div>
        <Tabs value={module} onValueChange={value => { window.location.hash = `about/${value}`; }} className="about-tabs">
          <TabsList aria-label="How dojo training works">{aboutModules.map(item => <TabsTrigger key={item.id} value={item.id}><span>{item.number}</span><strong>{item.name}</strong><small>+{rewards[item.id]} XP</small></TabsTrigger>)}</TabsList>
          {aboutModules.map(item => <TabsContent key={item.id} value={item.id}><div className="about-module-panel pixel-frame"><article><p className="eyebrow">{item.number} / {item.name}</p><h3>{item.title}</h3><p>{item.description}</p><p>{item.action}</p><a href={`#dojo/${item.id}`} className="pixel-button">{item.cta} <span aria-hidden="true">➜</span></a></article><aside className="about-module-preview" aria-label={`${item.name} preview`}><div className={`about-preview-scene card-art ${item.id === "quiz" ? "about-preview-quiz" : ""}`}><DojoArt {...item.art} source={item.id === "lesson" ? "./art/dojo-reference.png" : "./art/dojo-background-clean.png"} />{item.id !== "lesson" && <AnimatedFighter className="card-fighter" role={item.id === "warmup" ? "warmup" : "quiz"} />}</div><div className="about-reward"><strong>+{rewards[item.id]} XP</strong><span>{item.rewardCondition}</span><small>Awarded once per session</small></div></aside></div></TabsContent>)}
        </Tabs>
      </section>

      <section className="about-path pixel-frame" aria-labelledby="about-path-title"><div><p className="eyebrow">THE BELT PATH</p><h2 id="about-path-title">START SMALL. KEEP BUILDING.</h2><p>Eight belts describe the journey. Your first practice starts at White Belt.</p></div><ol>{belts.map(belt => <li key={belt.id} className={belt.available ? "available" : ""}><a href={`#belts/${belt.id}`} aria-label={`Explore the ${belt.name.toLowerCase()} belt`}><DojoArt x={belt.x} y={637} w={76} h={73} /><strong>{belt.name.toUpperCase()}</strong><small>{belt.available ? "PILOT READY" : "PLANNED"}</small></a></li>)}</ol><div className="about-path-note"><p><strong>AVAILABLE NOW / WHITE BELT</strong>Phishing awareness · 3 modules · 100 session XP<br />The full curriculum is in development.</p><a href="#belts" className="about-text-link">EXPLORE THE BELTS <span aria-hidden="true">➜</span></a></div></section>

      <section className="about-code" aria-labelledby="about-code-title"><div><p className="eyebrow">HOW WE PRACTICE</p><h2 id="about-code-title">ORDER. RESPECT. HONOR.</h2><p>Build your skill with a clear mind, care for others and honest progress. The dojo code gives those habits a place in every session.</p></div><a href="#philosophy" className="pixel-button pixel-button-light">READ OUR PHILOSOPHY <span aria-hidden="true">➜</span></a></section>

      <section className="about-faq" aria-labelledby="about-faq-title"><div className="about-section-title"><p className="eyebrow">BEFORE YOU BEGIN</p><h2 id="about-faq-title">A FEW CLEAR ANSWERS.</h2></div><div>{aboutQuestions.map(item => <details key={item.question} className="about-question"><summary>{item.question}<span className="philosophy-disclosure-marker" aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div></section>

      <section className="about-start pixel-frame" aria-labelledby="about-start-title"><div><p className="eyebrow">YOUR FIRST PRACTICE IS READY</p><h2 id="about-start-title">CURIOSITY IS ENOUGH TO BEGIN.</h2><p>One situation. One useful habit. Your first step into the dojo.</p></div><a href="#dojo/warmup" className="pixel-button">BEGIN YOUR FIRST PRACTICE <span aria-hidden="true">➜</span></a></section>
    </main>
    <DojoPageFooter />
  </div>;
}
