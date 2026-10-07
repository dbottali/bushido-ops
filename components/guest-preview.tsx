"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { DojoPageHeader,DojoPageFooter } from "./dojo-page-chrome";
import { AnimatedFighter } from "./animated-fighter";
import { RadioGroup,RadioGroupItem } from "./ui/radio-group";
import { emptyGuest,previewQuestions,previewScore } from "@/lib/guest-preview";
import { useCloud } from "./cloud-provider";

export function GuestPreviewPage({brand,headingRef}:{brand:ReactNode;headingRef:RefObject<HTMLHeadingElement|null>}) {
  const {guest,guestReady:ready,guestSaved:saved,saveGuest:change}=useCloud();
  const feedback=useRef<HTMLDivElement>(null);
  const answered=previewQuestions.filter(question=>guest.answers[question.id]!==undefined).length;
  return <div className="training-shell"><DojoPageHeader brand={brand} currentPage="dojo"/><main id="training-content" tabIndex={-1} className="training-main">
    <div className="training-intro"><div><p className="eyebrow">WHITE BELT / FREE GUEST PREVIEW</p><h1 ref={headingRef} tabIndex={-1}>YOUR FIRST THREE MOVES.</h1><p>Try three questions. Create a free account to continue White and keep your progress across devices.</p></div><AnimatedFighter role="warmup" className="training-fighter"/></div>
    <div className="journey-access"><span className="access-active">01 TRY IT</span><span>02 FREE ACCOUNT</span><span>03 COMPLETE WHITE</span><span>04 PREMIUM BELTS</span></div>
    <section className="practice-card pixel-frame"><p className="eyebrow">TRAINING PILOT · 3 QUESTIONS · NO PAYMENT</p><h2>PAUSE. VERIFY. PROTECT.</h2><p className="quiz-instructions">No timer. Review the explanations before your next step.</p>
      {previewQuestions.map((question,index)=><fieldset className="quiz-question" key={question.id}><legend><span>{String(index+1).padStart(2,"0")}</span> {question.prompt}</legend><RadioGroup aria-label={question.prompt} className="answer-group" value={guest.answers[question.id]??""} disabled={!ready||guest.submitted} onValueChange={answer=>change({...guest,answers:{...guest.answers,[question.id]:answer}})}>{question.options.map((option,i)=><label key={i} htmlFor={`guest-${question.id}-${i}`} className={`answer-option ${guest.answers[question.id]===String(i)?"selected":""}`}><RadioGroupItem value={String(i)} id={`guest-${question.id}-${i}`}/><span>{option}</span></label>)}</RadioGroup>{guest.submitted&&<p className={`question-feedback ${guest.answers[question.id]===String(question.correct)?"correct":""}`}><strong>{guest.answers[question.id]===String(question.correct)?"✓ Correct. ":"Keep practicing. "}</strong>{question.explanation}</p>}</fieldset>)}
      {!guest.submitted?<button className="pixel-button" type="button" disabled={!ready||answered!==3} onClick={()=>{change({...guest,submitted:true});requestAnimationFrame(()=>feedback.current?.focus());}}>CHECK MY ANSWERS</button>:<><div className={`feedback ${previewScore(guest)===3?"success":""}`} ref={feedback} tabIndex={-1} role="status"><strong>{previewScore(guest)} / 3. YOUR FIRST STEP IS DONE.</strong><p>{previewScore(guest)===3?"20 preview XP. Your answers will be checked again when you save them to an account.":"Your answers will come with you. You can retry this warm-up after signing in."}</p></div><div className="account-gate"><p className="eyebrow">CONTINUE WHITE FOR FREE</p><h2>A PLACE FOR YOUR PROGRESS.</h2><p>Create a free account to continue the lesson and quiz. White stays free; no card is required. Premium starts with Yellow, after earning White.</p><div className="practice-actions"><a className="pixel-button" href="#account/signup">CREATE FREE ACCOUNT ➜</a><a className="pixel-button pixel-button-light" href="#account/login">I ALREADY HAVE AN ACCOUNT</a></div></div><button type="button" className="about-text-link" onClick={()=>change(emptyGuest())}>TRY THESE THREE AGAIN</button></>}
    </section><p className="session-note">{saved?"Your preview is kept on this browser. After signing in, choose whether to add it to your account.":"This browser cannot save your preview. Keep this tab open and create an account to continue."} This pilot does not award the full White belt.</p>
  </main><DojoPageFooter/></div>;
}
