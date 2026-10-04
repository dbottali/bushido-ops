"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { DojoArt } from "@/components/dojo-art";
import { AnimatedFighter } from "@/components/animated-fighter";
import { PhilosophyPage } from "@/components/philosophy-page";
import { AboutPage } from "@/components/about-page";
import { isPrincipleId, principles, type PrincipleId } from "@/lib/philosophy-content";
import { belts, earnedXp, finishModule, questions, warmup, type ModuleId } from "@/lib/dojo-content";

type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: object; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => unknown };

function PixelButton({ children, href, light = false, onClick, disabled = false, className = "" }: {
  children: React.ReactNode; href?: string; light?: boolean; onClick?: () => void; disabled?: boolean; className?: string;
}) {
  const styles = `pixel-button ${light ? "pixel-button-light" : ""} ${className}`;
  return href ? <a className={styles} href={href}>{children}</a> : <button className={styles} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Brand() {
  return <a href="#" className="brand" aria-label="Bushido Ops home"><DojoArt x={197} y={10} w={58} h={55} className="brand-mark" /><span><strong>BUSHIDO OPS</strong><small lang="ja">デジタル道場</small></span></a>;
}

function ChoiceGroup({ options, value, onChange, name, disabled = false }: {
  options: readonly string[]; value: string; onChange: (value: string) => void; name: string; disabled?: boolean;
}) {
  return <RadioGroup className="answer-group" value={value} onValueChange={onChange} aria-label="Answer options" disabled={disabled}>{options.map((answer, i) => <label key={i} className={`answer-option ${value === String(i) ? "selected" : ""}`} htmlFor={`${name}-${i}`}><RadioGroupItem id={`${name}-${i}`} value={String(i)} /><span>{answer}</span></label>)}</RadioGroup>;
}

export default function Home() {
  const [view, setView] = useState<"home" | "dojo" | "philosophy" | "about">("home");
  const currentView = useRef(view);
  const [principle, setPrinciple] = useState<PrincipleId>("order");
  const [commitments, setCommitments] = useState<PrincipleId[]>([]);
  const [aboutModule, setAboutModule] = useState<ModuleId>("warmup");
  const [tab, setTab] = useState<ModuleId>("warmup");
  const [completed, setCompleted] = useState<ModuleId[]>([]);
  const [selectedBelt, setSelectedBelt] = useState<number | null>(null);
  const [warmupAnswer, setWarmupAnswer] = useState("");
  const [warmupChecked, setWarmupChecked] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>(["", "", ""]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef(completed);
  progressRef.current = completed;
  const xp = earnedXp(completed);
  const quizCorrect = questions.reduce((total, q, i) => total + (quizAnswers[i] === String(q.correct) ? 1 : 0), 0);
  const award = (module: ModuleId) => setCompleted(previous => finishModule(previous, module));

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash;
      const training = hash === "#dojo" || hash.startsWith("#dojo/") || hash === "#training-content";
      const philosophy = hash === "#philosophy" || hash.startsWith("#philosophy/") || hash === "#philosophy-content";
      const about = hash === "#about" || hash.startsWith("#about/") || hash === "#about-content";
      const nextView = training ? "dojo" : philosophy ? "philosophy" : about ? "about" : "home";
      const enteringView = currentView.current !== nextView;
      const afterViewChange = (action: () => void) => enteringView ? requestAnimationFrame(action) : action();
      currentView.current = nextView;
      setView(nextView);
      const module = hash.split("/")[1];
      if (training && ["warmup", "lesson", "quiz"].includes(module)) setTab(module as ModuleId);
      if (philosophy && isPrincipleId(module)) setPrinciple(module);
      else if (hash === "#philosophy") setPrinciple("order");
      if (about && ["warmup", "lesson", "quiz"].includes(module)) setAboutModule(module as ModuleId);
      else if (hash === "#about") setAboutModule("warmup");
      if (hash === "#training-content" || hash === "#philosophy-content" || hash === "#about-content") afterViewChange(() => {
        const target = document.getElementById(hash.slice(1));
        target?.scrollIntoView({ block: "start", behavior: "instant" });
        target?.focus({ preventScroll: true });
      });
      else if (philosophy && module === "code") afterViewChange(() => {
        document.getElementById("philosophy-code")?.scrollIntoView({ block: "start", behavior: "instant" });
        document.getElementById("philosophy-code-title")?.focus({ preventScroll: true });
      });
      else if (about && module === "how") afterViewChange(() => {
        document.getElementById("about-how")?.scrollIntoView({ block: "start", behavior: "instant" });
        document.getElementById("about-how-title")?.focus({ preventScroll: true });
      });
      else if (enteringView || training) afterViewChange(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        heading.current?.focus({ preventScroll: true });
      });
      if (!training && !philosophy && !about && hash && hash !== "#") afterViewChange(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: "center", behavior: enteringView ? "instant" : "smooth" }));
    };
    readHash(); window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  useEffect(() => {
    document.title = view === "about" ? "About | Bushido Ops" : view === "philosophy" ? "Philosophy | Bushido Ops" : "Bushido Ops | Digital self-defense for everyone";
  }, [view]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const agentTools = [
      { name: "read_training_progress", title: "Read dojo progress", description: "Read the current session's completed training modules and XP.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: () => ({ completed: progressRef.current, xp: earnedXp(progressRef.current), belt: "white", persistence: "current-session" }) },
      { name: "open_training_module", title: "Open a training module", description: "Navigate to a white-belt warm-up, lesson, or quiz. This does not complete training or award XP.", inputSchema: { type: "object", properties: { module: { type: "string", enum: ["warmup", "lesson", "quiz"] } }, required: ["module"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: (input: unknown) => {
        if (!input || typeof input !== "object" || !("module" in input) || !["warmup", "lesson", "quiz"].includes(String(input.module))) throw new Error("Choose warmup, lesson, or quiz.");
        window.location.hash = `dojo/${String(input.module)}`;
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve({ opened: input.module }))));
      } },
    ];
    for (const tool of agentTools) { try { void Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch(() => {}); } catch { /* Unsupported registration does not block training. */ } }
    return () => controller.abort();
  }, []);

  function changeTab(value: string) { window.location.hash = `dojo/${value}`; }

  return <>
    <a className="skip-link" href={view === "home" ? "#main" : view === "about" ? "#about-content" : view === "philosophy" ? "#philosophy-content" : "#training-content"}>Skip to content</a>
    {view === "home" ? <div className="home-shell">
      <div className="header-scene"><DojoArt x={0} y={0} w={1672} h={74} /></div>
      <header className="masthead pixel-frame"><Brand /><nav aria-label="Main navigation"><a href="#about">ABOUT</a><a href="#belts">BELTS</a><a href="#philosophy">PHILOSOPHY</a><a href="#dojo">DOJO</a></nav><PixelButton href="#dojo">ENTER THE DOJO <span aria-hidden="true">➜</span></PixelButton></header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <DojoArt x={0} y={74} w={199} h={292} className="hero-lantern" /><DojoArt x={199} y={91} w={49} h={101} className="hero-seal" /><div className="hero-scene"><DojoArt x={716} y={74} w={956} h={292} /><DojoArt x={716} y={74} w={956} h={292} source="./art/dojo-background-clean.png" className="hero-clean-scene" /><AnimatedFighter className="hero-fighter" role="hero" /></div>
          <div className="hero-copy"><h1 id="hero-title"><span className="sr-only">DIGITAL SELF-DEFENSE FOR EVERYONE</span><DojoArt x={270} y={92} w={447} h={155} className="hero-lettering" /></h1><h2>Cybersecurity training without gatekeeping.</h2><p>Bushido Ops is an anti-gatekeeping cybersecurity dojo.<br className="desktop-break" />We teach practical self-defense from complete beginner<br className="desktop-break" />upward—one go, just practical skills.</p><div className="hero-actions"><PixelButton href="#dojo">ENTER THE DOJO <span aria-hidden="true">➜</span></PixelButton><PixelButton light href="#belts">VIEW THE BELTS <span aria-hidden="true">➜</span></PixelButton></div></div>
        </section>
        <section className="activity-cards content-width" aria-label="How to train">{[
          { id: "warmup", title: "WARM-UP", copy: <>Sharpen your awareness<br />with quick wins.</>, icon: [166, 389, 44, 39], art: [360, 402, 232, 96] },
          { id: "lesson", title: "LESSON", copy: <>Bite-sized lessons.<br />Real-world skills.</>, icon: [633, 389, 51, 40], art: [822, 390, 212, 114] },
          { id: "quiz", title: "QUIZ", copy: <>Test your knowledge.<br />Level up.</>, icon: [1067, 389, 47, 41], art: [1258, 399, 247, 105] },
        ].map(card => <a key={card.id} href={`#dojo/${card.id}`} className={`activity-card pixel-frame card-${card.id}`}><div className="card-heading"><DojoArt x={card.icon[0]} y={card.icon[1]} w={card.icon[2]} h={card.icon[3]} /><h2>{card.title}</h2></div><p>{card.copy}</p><div className="card-art"><DojoArt x={card.art[0]} y={card.art[1]} w={card.art[2]} h={card.art[3]} />{card.id !== "lesson" && <><DojoArt x={card.art[0]} y={card.art[1]} w={card.art[2]} h={card.art[3]} source="./art/dojo-background-clean.png" className="card-clean-scene" /><AnimatedFighter className="card-fighter" role={card.id === "warmup" ? "warmup" : "quiz"} /></>}</div><span className="card-track" aria-hidden="true">▪ — — ▪ ···················</span></a>)}</section>
        <section className="why-section content-width" id="why-bushido-ops" aria-labelledby="why-title"><h2 className="section-heading" id="why-title"><span>WHY BUSHIDO OPS</span></h2><div className="values-grid">
          <div><DojoArt x={195} y={546} w={62} h={65} /><article><h3>ANTI-GATEKEEPING LEARNING</h3><p>No elitism. No jargon. Just clear,<br />welcoming training for all.</p></article></div>
          <div><DojoArt x={629} y={550} w={57} h={61} /><article><h3>PRACTICAL DIGITAL SELF-DEFENSE</h3><p>Real skills for real threats.<br />Use it. Apply it. Defend yourself.</p></article></div>
          <div><DojoArt x={1093} y={556} w={66} h={57} /><article><h3>STEADY, BELT-BASED PROGRESS</h3><p>Clear path. Visible progress.<br />Earn your belt. Keep growing.</p></article></div>
        </div></section>
        <section className="belt-section content-width" id="belts" aria-labelledby="belt-title"><h2 className="section-heading" id="belt-title"><span>THE BELT PATH</span></h2><div className="belt-path">{belts.map((belt, i) => <button key={belt.name} className="belt-step" onClick={() => setSelectedBelt(i)} aria-label={`Explore the ${belt.name.toLowerCase()} belt`} style={{ "--idle-delay": `${i * -0.71}s`, "--idle-period": `${5.2 + (i % 3) * 0.9}s` } as React.CSSProperties}><div className="belt-art"><DojoArt x={belt.x} y={637} w={76} h={73} className="belt-character" /><DojoArt x={belt.x + 76} y={651} w={57} h={44} className="belt-symbol" /></div><strong>{belt.name.toUpperCase()}</strong></button>)}</div></section>
        <section className="principles content-width" aria-label="Bushido principles">{principles.map(p => <a key={p.id} href={`#philosophy/${p.id}`} aria-label={`Explore ${p.name.toLowerCase()}`}><DojoArt x={p.icon.x} y={738} w={p.icon.w} h={61} /><article><h3>{p.name}</h3><p>{p.homeCopy[0]}<br />{p.homeCopy[1]}</p></article></a>)}</section>
      </main>
      <footer className="journey-footer"><div className="footer-left"><DojoArt x={0} y={810} w={343} h={131} /><DojoArt x={0} y={810} w={343} h={131} source="./art/dojo-background-clean.png" className="footer-clean-scene" /><AnimatedFighter className="footer-fighter" role="footer" /></div><DojoArt x={1415} y={810} w={257} h={131} className="footer-right" /><div className="footer-message"><h2><span className="sr-only">READY TO BEGIN YOUR JOURNEY?</span><DojoArt x={358} y={830} w={563} h={39} className="footer-lettering" /></h2><p>Step onto the path. Train with purpose. Earn your belt.</p><div className="footer-progress"><span>LVL 01</span><Progress value={xp} aria-label="White belt practice progress" /><span>{xp} / 100 XP</span><span className="coins">◉ 000</span></div></div><div className="footer-action"><PixelButton href="#dojo">ENTER THE DOJO <span aria-hidden="true">➜</span></PixelButton><p>No signup. No gatekeeping. Just training.</p></div></footer>
    </div> : view === "about" ? <AboutPage brand={<Brand />} headingRef={heading} module={aboutModule} /> : view === "philosophy" ? <PhilosophyPage brand={<Brand />} headingRef={heading} principle={principle} commitments={commitments} onToggleCommitment={id => setCommitments(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id])} /> : <div className="training-shell">
      <header className="training-header pixel-frame"><Brand /><a className="back-home" href="#">HOME</a><span className="training-xp" aria-live="polite">WHITE BELT · {xp} XP</span></header>
      <main className="training-main" id="training-content" tabIndex={-1}><div className="training-intro"><div><p className="eyebrow">WHITE BELT / FIRST PRACTICE</p><h1 ref={heading} tabIndex={-1}>PAUSE. VERIFY. PROTECT.</h1><p>Learn to spot the pressure behind a suspicious message.</p></div><AnimatedFighter className="training-fighter" role="training" /></div><div className="practice-progress"><span>{completed.length} / 3 complete</span><Progress value={xp} aria-label="Training progress" /><strong>{xp} / 100 XP</strong></div>
        <Tabs value={tab} onValueChange={changeTab} className="training-tabs"><TabsList aria-label="Training modules"><TabsTrigger value="warmup">01 WARM-UP {completed.includes("warmup") ? "✓" : ""}</TabsTrigger><TabsTrigger value="lesson">02 LESSON {completed.includes("lesson") ? "✓" : ""}</TabsTrigger><TabsTrigger value="quiz">03 QUIZ {completed.includes("quiz") ? "✓" : ""}</TabsTrigger></TabsList>
          <TabsContent value="warmup"><section className="practice-card pixel-frame"><p className="eyebrow">A QUICK WIN · +20 XP</p><h2>Don’t let urgency choose for you.</h2><div className="sample-message"><span>FROM: Account Security &lt;support@account-help.example&gt;</span><strong>URGENT: Your account will be deleted</strong><p>Confirm your login in the next 30 minutes to avoid losing access.</p><span className="sample-link">[ Confirm account ]</span><small>Training example — no real link.</small></div><h3>{warmup.prompt}</h3><ChoiceGroup options={warmup.options} name="warmup" value={warmupAnswer} onChange={v => { setWarmupAnswer(v); setWarmupChecked(false); }} />{warmupChecked && <div role="status" className={`feedback ${Number(warmupAnswer) === warmup.correct ? "success" : ""}`}><strong>{Number(warmupAnswer) === warmup.correct ? "Good instinct. +20 XP earned." : "Pause and try again."}</strong><p>Urgency is a pressure tactic. Open the official service yourself and check there. An unusual sender is a clue, not proof on its own.</p></div>}<div className="practice-actions"><PixelButton disabled={warmupAnswer === ""} onClick={() => { setWarmupChecked(true); if (Number(warmupAnswer) === warmup.correct) award("warmup"); }}>{completed.includes("warmup") ? "CHECK AGAIN" : "CHECK ANSWER"}</PixelButton>{completed.includes("warmup") && <PixelButton light href="#dojo/lesson">CONTINUE TO LESSON</PixelButton>}</div></section></TabsContent>
          <TabsContent value="lesson"><section className="practice-card pixel-frame"><p className="eyebrow">BITE-SIZED LESSON · +30 XP</p><h2>The three-move defense.</h2><p>Phishing is a deceptive message designed to make you reveal information, send money, or take a harmful action. It can arrive by email, text, social media, or a phone call.</p><div className="lesson-moves"><article><span>01</span><div><h3>Pause</h3><p>Slow down when a message creates urgency, fear, or an unexpected reward. A deadline does not make a request trustworthy.</p></div></article><article><span>02</span><div><h3>Verify</h3><p>Open the official app, type a known website address, or call a number you already trust. Check the request through that independent channel.</p></div></article><article><span>03</span><div><h3>Protect</h3><p>Keep passwords and one-time sign-in codes private. Report suspicious messages using the service’s or your organization’s reporting process.</p></div></article></div><aside className="lesson-note"><strong>A logo is decoration, not verification.</strong><p>A familiar logo, a polished message, or your real name does not prove who sent it.</p></aside><div className="practice-actions"><PixelButton onClick={() => award("lesson")} disabled={completed.includes("lesson")}>{completed.includes("lesson") ? "LESSON COMPLETE ✓" : "MARK LESSON COMPLETE"}</PixelButton><PixelButton light href="#dojo/quiz">TAKE THE QUIZ</PixelButton></div></section></TabsContent>
          <TabsContent value="quiz"><section className="practice-card pixel-frame"><p className="eyebrow">KNOWLEDGE CHECK · +50 XP</p><h2>Put your instincts to the test.</h2><p>Three questions. Take your time. You can retry and learn from each answer.</p>{questions.map((question, i) => <fieldset className="quiz-question" key={i}><legend><span>0{i + 1}</span> {question.prompt}</legend><ChoiceGroup name={`quiz-${i}`} options={question.options} value={quizAnswers[i]} onChange={value => setQuizAnswers(previous => previous.map((v, j) => j === i ? value : v))} disabled={quizSubmitted} />{quizSubmitted && <p className={`question-feedback ${quizAnswers[i] === String(question.correct) ? "correct" : ""}`}><strong>{quizAnswers[i] === String(question.correct) ? "✓ Correct. " : "Keep practicing. "}</strong>{question.explanation}</p>}</fieldset>)}{quizSubmitted && <div role="status" className={`feedback ${quizCorrect === 3 ? "success" : ""}`}><strong>{quizCorrect === 3 ? "3 / 3. Practice complete. +50 XP earned." : `${quizCorrect} / 3. Review the explanations and try again.`}</strong><p>{quizCorrect === 3 ? "Keep the habit: pause, verify independently, and protect your sign-in details." : "You earn quiz XP when all three answers are correct."}</p></div>}<div className="practice-actions">{!quizSubmitted ? <PixelButton disabled={quizAnswers.some(answer => answer === "")} onClick={() => { setQuizSubmitted(true); if (quizCorrect === 3) award("quiz"); }}>CHECK MY ANSWERS</PixelButton> : <PixelButton light onClick={() => { setQuizAnswers(["", "", ""]); setQuizSubmitted(false); }}>PRACTICE AGAIN</PixelButton>}<PixelButton light href="#">RETURN TO THE DOJO HOME</PixelButton></div></section></TabsContent>
        </Tabs>{xp === 100 && <div className="practice-complete" role="status"><strong>WHITE BELT PRACTICE COMPLETE</strong><p>100 XP. One useful habit you can use today.</p></div>}<p className="session-note">Pilot practice. Progress is kept for this open session. The full belt curriculum is in development.</p>
      </main><footer className="training-footer">BUSHIDO OPS <span>Order. Respect. Honor.</span></footer>
    </div>}
    <Dialog open={selectedBelt !== null} onOpenChange={open => { if (!open) setSelectedBelt(null); }}><DialogContent className="belt-dialog pixel-frame">{selectedBelt !== null && <><DojoArt x={belts[selectedBelt].x} y={637} w={133} h={73} className="dialog-character" /><p className="eyebrow">THE BELT PATH</p><DialogTitle>{belts[selectedBelt].name.toUpperCase()} BELT</DialogTitle><h3>{belts[selectedBelt].topic}</h3><DialogDescription>{belts[selectedBelt].description}</DialogDescription><p className="belt-availability">{belts[selectedBelt].available ? "First practice available · 3 modules · 100 XP" : "Curriculum preview · training coming later"}</p>{belts[selectedBelt].available && <PixelButton onClick={() => { setSelectedBelt(null); window.location.hash = "dojo/warmup"; }}>START WHITE BELT PRACTICE</PixelButton>}</>}</DialogContent></Dialog>
  </>;
}
