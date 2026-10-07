"use client";

import { useEffect,useRef,useState,type ReactNode,type RefObject } from "react";
import { DojoPageHeader,DojoPageFooter } from "./dojo-page-chrome";
import { useCloud,CloudError } from "./cloud-provider";
import { GuestPreviewPage } from "./guest-preview";
import { GuestMigration } from "./account-page";
import { AnimatedFighter } from "./animated-fighter";
import { Progress } from "./ui/progress";
import { RadioGroup,RadioGroupItem } from "./ui/radio-group";
import type { CloudCourse,CloudModule,CloudModuleProgress,LearningEvent } from "@/lib/cloud-types";
import type { TrainingRoute } from "@/lib/dojo-routes";
import { trainingHref } from "@/lib/course-engine";

function ModuleStep({course,module,locked}:{course:CloudCourse;module:CloudModule;locked:boolean}) {
  const cloud=useCloud();
  const progress=cloud.snapshot?.modules.find(item=>item.course_id===course.id&&item.module_id===module.id);
  const storageKey=`bushido-ops.cloud-draft.${cloud.session!.user.id}.${course.id}.${module.id}`;
  const [answers,setAnswers]=useState<Record<string,string>>(progress?.answers??{}),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false);
  const [failure,setFailure]=useState<string|null>(null),[conflict,setConflict]=useState(false),[localSaved,setLocalSaved]=useState(true),[pulse,setPulse]=useState(false);
  const revision=useRef(progress?.revision??0),draft=useRef(answers),inFlight=useRef(false),pending=useRef<LearningEvent|null>(null),alive=useRef(true),feedback=useRef<HTMLDivElement>(null);
  const keep=(value:Record<string,string>,request:LearningEvent|null=pending.current)=>{
    try{window.localStorage.setItem(storageKey,JSON.stringify({answers:value,revision:revision.current,request}));setLocalSaved(true);}catch{setLocalSaved(false);}
  };
  const clear=()=>{try{window.localStorage.removeItem(storageKey);}catch{/* May be denied. */}};
  useEffect(()=>{
    alive.current=true;
    try{const raw=window.localStorage.getItem(storageKey);if(raw){const saved=JSON.parse(raw);if(saved.answers&&typeof saved.answers==="object"&&!Array.isArray(saved.answers)){
      const valid=Object.fromEntries((module.questions??[]).map(q=>[q.id,typeof saved.answers[q.id]==="string"&&/^(|[0-9])$/.test(saved.answers[q.id])&&Number(saved.answers[q.id])<q.options.length?saved.answers[q.id]:""]));
      draft.current=valid;setAnswers(valid);setDirty(true);
      if(saved.revision!==revision.current){setConflict(true);setFailure("A saved draft and the cloud version differ. Review the saved answers before continuing.");}
      else if(saved.request?.courseId===course.id&&saved.request?.moduleId===module.id&&typeof saved.request.requestId==="string")pending.current=saved.request;
    }}}
    catch{setLocalSaved(false);}
    return()=>{alive.current=false;};
  },[storageKey]);
  useEffect(()=>{
    if((progress?.revision??0)===revision.current||inFlight.current)return;
    if(dirty){setConflict(true);setFailure("This step changed on another device. Your draft is kept here. Load the cloud answers to continue.");}
    else{revision.current=progress?.revision??0;draft.current=progress?.answers??{};setAnswers(draft.current);}
  },[progress?.revision,dirty]);
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue="";}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  const run=async(action:LearningEvent["action"])=>{
    if(inFlight.current||locked||conflict)return;
    inFlight.current=true;setBusy(true);setFailure(null);
    const sent={...draft.current};
    const previous=pending.current;
    const request=previous&&previous.action===action&&JSON.stringify(previous.answers??{})===JSON.stringify(sent)?previous:{courseId:course.id,moduleId:module.id,action,answers:sent,expectedRevision:revision.current,requestId:crypto.randomUUID()};
    pending.current=request;keep(sent,request);
    try{
      const result=await cloud.event(request);
      const fresh=result.snapshot.modules.find(item=>item.course_id===course.id&&item.module_id===module.id);
      revision.current=fresh?.revision??revision.current;
      pending.current=null;
      if(!alive.current){
        if(JSON.stringify(draft.current)===JSON.stringify(sent)||action==="retry")clear();
        return;
      }
      if(JSON.stringify(draft.current)===JSON.stringify(sent)||action==="retry"){
        draft.current=fresh?.answers??{};setAnswers(draft.current);setDirty(false);clear();
      }else{keep(draft.current,null);setDirty(true);}
      if(action==="submit"||action==="lesson"){setPulse(!!fresh?.completed);requestAnimationFrame(()=>feedback.current?.focus());}
    }catch(error){
      if(!alive.current)return;setFailure((error as Error).message);
      if(error instanceof CloudError&&error.status===409)setConflict(true);
    }finally{inFlight.current=false;if(alive.current)setBusy(false);}
  };
  useEffect(()=>{
    if(!dirty||busy||failure||conflict||locked||progress?.submitted||module.kind==="lesson")return;
    const timer=setTimeout(()=>void run("draft"),700);return()=>clearTimeout(timer);
  },[answers,dirty,busy,failure,conflict,locked,progress?.submitted]);
  const loadSaved=()=>{revision.current=progress?.revision??0;draft.current=progress?.answers??{};setAnswers(draft.current);pending.current=null;setDirty(false);setConflict(false);setFailure(null);clear();};
  const questionCount=module.questions?.length??0,answered=(module.questions??[]).filter(q=>answers[q.id]!==undefined&&answers[q.id]!=="").length;
  if(locked)return <section className="practice-card pixel-frame"><p className="eyebrow">ONE STEP AT A TIME</p><h2>COMPLETE THE PREVIOUS STEPS.</h2><p>Your next lesson and exam unlock after the earlier practice is complete.</p><a className="pixel-button" href={trainingHref(course.id)}>RETURN TO YOUR NEXT STEP ➜</a></section>;
  return <section className="practice-card pixel-frame"><p className="eyebrow">{module.kind==="lesson"?"BITE-SIZED LESSON":module.kind==="exam"?"FINAL KNOWLEDGE CHECK":module.kind==="warmup"?"A QUICK WIN":"KNOWLEDGE CHECK"} · {module.reward} XP / COUNTED ONCE</p><h2>{module.intro}</h2>
    {module.kind==="lesson"?<div className="lesson-moves">{module.sections?.map((section,index)=><article key={index}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{section.title}</h3><p>{section.body}</p></div></article>)}</div>:<><p className="quiz-instructions">{questionCount} questions. {module.passingScore} correct to pass. Your answers are checked by the dojo server.</p>{module.questions?.map((question,index)=><fieldset className="quiz-question" key={question.id}><legend><span>{String(index+1).padStart(2,"0")}</span> {question.prompt}</legend><RadioGroup aria-label={question.prompt} className="answer-group" value={answers[question.id]??""} disabled={!!progress?.submitted||conflict||busy} onValueChange={answer=>{const next={...draft.current,[question.id]:answer};draft.current=next;setAnswers(next);setDirty(true);setFailure(null);pending.current=null;keep(next,null);}}>{question.options.map((option,i)=><label className={`answer-option ${answers[question.id]===String(i)?"selected":""}`} key={i} htmlFor={`${course.id}-${module.id}-${question.id}-${i}`}><RadioGroupItem id={`${course.id}-${module.id}-${question.id}-${i}`} value={String(i)}/><span>{option}</span></label>)}</RadioGroup>{progress?.submitted&&progress.feedback?.questions.find(item=>item.id===question.id)&&<p className={`question-feedback ${progress.feedback.questions.find(item=>item.id===question.id)?.correct?"correct":""}`}><strong>{progress.feedback.questions.find(item=>item.id===question.id)?.correct?"✓ Correct. ":"Keep practicing. "}</strong>{progress.feedback.questions.find(item=>item.id===question.id)?.explanation}</p>}</fieldset>)}</>}
    {(progress?.submitted||progress?.completed&&module.kind==="lesson")&&<div ref={feedback} tabIndex={-1} role="status" className={`feedback ${progress.completed?`success ${pulse?"reward-feedback":""}`:""}`}><strong>{module.kind==="lesson"?"LESSON COMPLETE":`${progress.feedback?.score??0} / ${progress.feedback?.total??questionCount}. ${progress.feedback?.passed?"PRACTICE PASSED.":"REVIEW AND TRY AGAIN."}`}</strong><p>{progress.completed?`${module.reward} XP counted once. Repeating this step never duplicates the reward.`:"Review the explanations and choose Practice again for another attempt."}</p></div>}
    <div className="practice-actions">{module.kind==="lesson"?<button className="pixel-button" disabled={busy||!!progress?.completed} onClick={()=>void run("lesson")}>{progress?.completed?"LESSON COMPLETE ✓":busy?"SAVING…":"MARK LESSON COMPLETE"}</button>:progress?.submitted?<button className="pixel-button pixel-button-light" disabled={busy} onClick={()=>void run("retry")}>PRACTICE AGAIN</button>:<><button className="pixel-button" disabled={busy||conflict||answered!==questionCount} onClick={()=>void run("submit")}>{busy?"SAVING…":"CHECK MY ANSWERS"}</button><button className="pixel-button pixel-button-light" disabled={busy||conflict||!dirty} onClick={()=>void run("draft")}>SAVE ANSWERS</button></>}</div>
    <p className="cloud-save-state" role="status">{busy?"SAVING TO YOUR ACCOUNT…":conflict?"DRAFT NEEDS REVIEW":failure?"WAITING TO RECONNECT":dirty?localSaved?"DRAFT KEPT ON THIS DEVICE / WAITING TO SAVE":"UNSAVED DRAFT / KEEP THIS TAB OPEN":"SAVED TO YOUR ACCOUNT"}</p>
    {failure&&<div className="feedback" role="alert"><p>{failure}</p><div className="practice-actions">{conflict?<button className="pixel-button pixel-button-light" onClick={loadSaved}>LOAD CLOUD ANSWERS</button>:<button className="pixel-button pixel-button-light" disabled={busy} onClick={()=>void run(pending.current?.action??"draft")}>RETRY SAVE</button>}</div></div>}
  </section>;
}

export function CloudCoursePlayer({brand,headingRef,route}:{brand:ReactNode;headingRef:RefObject<HTMLHeadingElement|null>;route:TrainingRoute}) {
  const cloud=useCloud();
  const available=cloud.courses.filter(course=>course.access==="open"&&course.availability==="available");
  const candidate=available.find(course=>cloud.snapshot?.modules.some(item=>item.course_id===course.id)&&cloud.snapshot!.modules.filter(item=>item.course_id===course.id&&item.completed).length<course.moduleCount)??available.find(course=>cloud.snapshot!.modules.filter(item=>item.course_id===course.id&&item.completed).length<course.moduleCount)??available[0];
  const courseId=route.courseId||candidate?.id||"",access=cloud.courses.find(course=>course.id===courseId)?.access;
  const [course,setCourse]=useState<CloudCourse|null>(null),[failure,setFailure]=useState<string|null>(null),[loading,setLoading]=useState(false),[activeId,setActiveId]=useState("");
  useEffect(()=>{
    let alive=true;setCourse(null);setFailure(null);
    if(!cloud.session||!cloud.snapshot||!courseId||route.error)return;
    setLoading(true);
    void cloud.api<{course:CloudCourse}>(`courses/${courseId}`).then(result=>{if(alive){setCourse(result.course);setActiveId(route.moduleId??result.course.modules.find(module=>!cloud.snapshot!.modules.some(item=>item.course_id===courseId&&item.module_id===module.id&&item.completed))?.id??result.course.modules[0]?.id??"");}}).catch(error=>{if(alive)setFailure((error as Error).message);}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[cloud.api,cloud.session?.user.id,!!cloud.snapshot,courseId,access]);
  useEffect(()=>{if(route.moduleId)setActiveId(route.moduleId);},[route.moduleId]);
  if(!cloud.session)return <GuestPreviewPage brand={brand} headingRef={headingRef}/>;
  const active=course?.modules.find(module=>module.id===activeId);
  if(route.error||failure||!course||!active)return <div className="dojo-page-shell"><DojoPageHeader brand={brand} currentPage="dojo"/><main className="training-main training-unavailable pixel-frame" id="training-content" tabIndex={-1}><p className="eyebrow">YOUR TRAINING PATH</p><h1 ref={headingRef} tabIndex={-1}>{loading||!cloud.snapshot?"OPENING YOUR DOJO…":access==="planned"?"STILL IN DEVELOPMENT.":"YOUR NEXT STEP."}</h1><p>{route.error??failure??(course&&!active?"This step is not part of this course.":loading||!cloud.snapshot?"Checking your account and course access.":"No training has been published for your account yet.")}</p><div className="practice-actions"><a className="pixel-button" href="#my-dojo">MY DOJO ➜</a><a className="pixel-button pixel-button-light" href="#account">ACCOUNT / ACCESS</a></div></main><DojoPageFooter/></div>;
  const index=course.modules.indexOf(active),completed=course.modules.filter(module=>cloud.snapshot!.modules.some(item=>item.course_id===course.id&&item.module_id===module.id&&item.completed));
  const locked=course.modules.slice(0,index).some(module=>!completed.includes(module)),next=course.modules[index+1],previous=course.modules[index-1];
  return <div className="training-shell"><DojoPageHeader brand={brand} currentPage="dojo"/><main id="training-content" tabIndex={-1} className="training-main"><nav className="training-breadcrumb" aria-label="Training location"><a href="#my-dojo">MY DOJO</a><span>/</span><a href={`#belts/${course.belt}`}>{course.belt.toUpperCase()} BELT</a></nav><div className="training-intro"><div><p className="eyebrow">{course.belt.toUpperCase()} BELT / ACCOUNT PRACTICE</p><h1 ref={headingRef} tabIndex={-1}>{course.title}</h1><p>{course.summary}</p></div><AnimatedFighter role={active.kind==="warmup"?"warmup":active.kind==="exam"||active.kind==="quiz"?"quiz":"training"} className="training-fighter"/></div>{course.testContent&&<p className="pilot-label">TRAINING PILOT / Test material. {course.awardsBelt?"Awards in this staging environment are test awards.":"Completing this pilot does not award a full belt."}</p>}<GuestMigration/>
    <div className="practice-progress"><span>{completed.length} / {course.modules.length} complete</span><Progress value={completed.length/course.modules.length*100} aria-label="Course completion"/><strong>{completed.reduce((sum,module)=>sum+module.reward,0)} / {course.modules.reduce((sum,module)=>sum+module.reward,0)} XP</strong></div>
    <nav className="cloud-module-nav" aria-label="Training modules">{course.modules.map((module,i)=><a key={module.id} href={trainingHref(course.id,module.id)} aria-current={module.id===active.id?"step":undefined}>{String(i+1).padStart(2,"0")} {module.title} {completed.includes(module)?"✓":""}</a>)}</nav>
    <p className="training-step-label">STEP {index+1} OF {course.modules.length} <span>{active.title}</span></p><ModuleStep key={`${cloud.session.user.id}/${course.id}/${active.id}`} course={course} module={active} locked={locked}/>
    <nav className="training-step-nav" aria-label="Previous and next training step"><a className="pixel-button pixel-button-light" href={previous?trainingHref(course.id,previous.id):"#my-dojo"}>← {previous?"PREVIOUS STEP":"MY DOJO"}</a><a className="pixel-button" href={next?trainingHref(course.id,next.id):"#my-dojo"}>{next?"NEXT STEP":"VIEW MY PROGRESS"} ➜</a></nav>
    {completed.length===course.modules.length&&<div className="practice-complete" role="status"><strong>{cloud.snapshot?.awards.some(item=>item.course_id===course.id)?`${course.belt.toUpperCase()} BELT EARNED`:"PRACTICE COMPLETE"}</strong><p>{course.awardsBelt?"The server recorded your course and final exam result.":"Your pilot progress is saved. The full belt curriculum is still being prepared."}</p><a href="#my-dojo">SEE YOUR NEXT MOVE ➜</a></div>}<p className="session-note">Answers save to your account. Offline drafts stay on this device until a save succeeds. Rewards and access follow the server rules.</p>
  </main><DojoPageFooter/></div>;
}
