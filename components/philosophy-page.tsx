"use client";

import type { ReactNode, RefObject } from "react";
import { AnimatedFighter } from "@/components/animated-fighter";
import { DojoArt } from "@/components/dojo-art";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { principles, type PrincipleId } from "@/lib/philosophy-content";

type Props = {
  brand: ReactNode;
  headingRef: RefObject<HTMLHeadingElement | null>;
  principle: PrincipleId;
  commitments: PrincipleId[];
  onToggleCommitment: (id: PrincipleId) => void;
};

export function PhilosophyPage({ brand, headingRef, principle, commitments, onToggleCommitment }: Props) {
  const allChosen = commitments.length === principles.length;

  return <div className="philosophy-shell">
    <header className="philosophy-header pixel-frame">
      {brand}
      <nav aria-label="Main navigation"><a href="#">HOME</a><a href="#belts">BELTS</a><a href="#philosophy" aria-current="page">PHILOSOPHY</a></nav>
      <a className="pixel-button" href="#dojo/warmup">ENTER THE DOJO <span aria-hidden="true">➜</span></a>
    </header>

    <main id="philosophy-content" tabIndex={-1} className="philosophy-main">
      <section className="philosophy-intro" aria-labelledby="philosophy-title">
        <div className="philosophy-intro-copy">
          <p className="eyebrow">PHILOSOPHY / THE DOJO CODE</p>
          <h1 id="philosophy-title" ref={headingRef} tabIndex={-1}><span>TRAIN YOUR SKILL.</span><span>CHOOSE YOUR CONDUCT.</span></h1>
          <p className="philosophy-lead">A clear mind. Respectful practice. Honest progress.</p>
          <p>Bushido Ops takes inspiration from martial-arts practice: repeat the basics, act with care and help the next learner. Our code gives those habits a place in your digital life.</p>
          <a className="pixel-button pixel-button-light" href="#philosophy/code" onClick={event => {
            if (window.location.hash !== "#philosophy/code") return;
            event.preventDefault();
            document.getElementById("philosophy-code")?.scrollIntoView({ block: "start", behavior: "instant" });
            document.getElementById("philosophy-code-title")?.focus({ preventScroll: true });
          }}>BUILD YOUR DOJO CODE <span aria-hidden="true">↓</span></a>
        </div>
        <div className="philosophy-dojo pixel-frame">
          <div className="philosophy-stage">
            <DojoArt x={716} y={74} w={956} h={292} />
            <DojoArt x={716} y={74} w={956} h={292} source="./art/dojo-background-clean.png" className="hero-clean-scene" />
            <AnimatedFighter className="hero-fighter" role="hero" />
          </div>
          <p><span aria-hidden="true">✣</span> A BEGINNER’S MIND. A DEFENDER’S HABITS.</p>
        </div>
      </section>

      <div className="philosophy-manifesto" aria-label="Our approach"><span>EVERYONE STARTS SOMEWHERE</span><span>PRACTICE WITH PURPOSE</span><span>HELP THE NEXT PERSON</span></div>

      <section className="philosophy-principles" aria-labelledby="philosophy-principles-title">
        <div className="philosophy-section-title"><p className="eyebrow">THE FOUNDATION</p><h2 id="philosophy-principles-title">THREE PRINCIPLES. EVERY SESSION.</h2><p>Choose a principle. See what it looks like in practice.</p></div>
        <Tabs value={principle} onValueChange={id => { window.location.hash = `philosophy/${id}`; }} className="philosophy-tabs">
          <TabsList aria-label="Philosophy principles">{principles.map(item => <TabsTrigger key={item.id} value={item.id}>
            <DojoArt x={item.icon.x} y={738} w={item.icon.w} h={61} />
            <span><small>{item.number} / PRINCIPLE</small><strong>{item.name}</strong></span>
          </TabsTrigger>)}</TabsList>
          {principles.map(item => <TabsContent key={item.id} value={item.id}>
            <div className="philosophy-principle-panel pixel-frame">
              <article className="philosophy-principle-copy">
                <p className="eyebrow">{item.number} / {item.name}</p><h3>{item.title}</h3><p>{item.description}</p>
                <h4>PUT IT INTO PRACTICE</h4>
                <ul>{item.habits.map(habit => <li key={habit}><span aria-hidden="true">▪</span>{habit}</li>)}</ul>
                <p className="philosophy-maxim">{item.maxim}</p>
              </article>
              <aside className="philosophy-scenario" aria-labelledby={`scenario-${item.id}`}>
                <p className="eyebrow">IN THE REAL WORLD</p><h3 id={`scenario-${item.id}`}>{item.scenario.title}</h3><p>{item.scenario.situation}</p>
                <details className="philosophy-reflection"><summary>See the principle in action <span className="philosophy-disclosure-marker" aria-hidden="true" /></summary><div><h4>YOUR NEXT MOVE</h4><p>{item.scenario.response}</p><p className="philosophy-scenario-reflection">{item.scenario.reflection}</p></div></details>
              </aside>
            </div>
          </TabsContent>)}
        </Tabs>
      </section>

      <section className="philosophy-code pixel-frame" id="philosophy-code" aria-labelledby="philosophy-code-title">
        <div className="philosophy-code-heading"><div><p className="eyebrow">TAKE IT WITH YOU</p><h2 id="philosophy-code-title" tabIndex={-1}>YOUR DOJO CODE</h2><p>Choose the habits you want to bring into your next session.</p></div><span className="philosophy-code-count" role="status" aria-live="polite">{commitments.length} / 3 HABITS CHOSEN</span></div>
        <fieldset><legend className="sr-only">Habits for your next session</legend>{principles.map(item => <label key={item.id} className={`philosophy-commitment ${commitments.includes(item.id) ? "chosen" : ""}`}>
          <input type="checkbox" checked={commitments.includes(item.id)} onChange={() => onToggleCommitment(item.id)} /><span><strong>{item.name}</strong>{item.commitment}</span>
        </label>)}</fieldset>
        <div className="philosophy-code-action"><p role="status">{allChosen ? "You have your code. Put it into practice." : "Small choices. Repeated with purpose."}</p><a className="pixel-button" href="#dojo/warmup">START WHITE BELT <span aria-hidden="true">➜</span></a></div>
      </section>

      <section className="philosophy-learning" aria-labelledby="philosophy-learning-title"><div><p className="eyebrow">NO GATEKEEPING</p><h2 id="philosophy-learning-title">YOU DON’T HAVE TO KNOW EVERYTHING TO BEGIN.</h2><p>Ask the question. Make the attempt. Learn from the result. Every belt begins with basics, and everyone deserves a place to practice them.</p></div><a href="#belts" className="pixel-button pixel-button-light">EXPLORE THE BELT PATH <span aria-hidden="true">➜</span></a></section>
      <div className="philosophy-reading"><span>KEEP LEARNING</span><a href="https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams" target="_blank" rel="noopener noreferrer">FTC: spotting phishing <span className="sr-only">(opens in a new tab)</span>↗</a><a href="https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">OWASP: responsible research <span className="sr-only">(opens in a new tab)</span>↗</a></div>
    </main>
    <footer className="philosophy-footer"><a href="#">BUSHIDO OPS / HOME</a><span>ORDER. RESPECT. HONOR.</span><a href="#dojo">ENTER THE DOJO ➜</a></footer>
  </div>;
}
