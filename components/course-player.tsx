"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatedFighter } from "@/components/animated-fighter";
import { DojoPageHeader, DojoPageFooter } from "@/components/dojo-page-chrome";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { courseCatalog } from "@/lib/course-catalog";
import { canTrain, completedModules, courseComplete, courseMaxXp, courseXp, gradeModule, moduleProgress, moduleQuestions, trainingHref } from "@/lib/course-engine";
import { belts } from "@/lib/dojo-content";
import type { TrainingRoute } from "@/lib/dojo-routes";
import type { Question } from "@/lib/course-types";
import type { ProgressSnapshot, ProgressStore } from "@/lib/dojo-progress";

function Choices({ question, value, onChange, name, disabled }: { question: Question; value: string; onChange: (value: string) => void; name: string; disabled?: boolean }) {
  return <RadioGroup className="answer-group" value={value} onValueChange={onChange} aria-label={question.prompt} disabled={disabled}>{question.options.map((answer, index) => <label key={index} className={`answer-option ${value === String(index) ? "selected" : ""}`} htmlFor={`${name}-${index}`}><RadioGroupItem id={`${name}-${index}`} value={String(index)} /><span>{answer}</span></label>)}</RadioGroup>;
}

type Props = { brand: ReactNode; headingRef: RefObject<HTMLHeadingElement | null>; route: TrainingRoute; store: ProgressStore; snapshot: ProgressSnapshot };
export function CoursePlayer({ brand, headingRef, route, store, snapshot }: Props) {
  const feedback = useRef<HTMLDivElement>(null);
  const [feedbackPulse, setFeedbackPulse] = useState<string | null>(null);
  const course = courseCatalog.courses.find(item => item.id === route.courseId);
  const active = course?.modules.find(item => item.id === route.moduleId);
  const allowed = course && canTrain(snapshot.data, course, courseCatalog);
  const check = () => {
    if (!course || !active) return;
    setFeedbackPulse(gradeModule(active, moduleProgress(snapshot.data, course, active)).passed ? active.id : null);
    store.dispatch({ type: "submit", courseId: course.id, moduleId: active.id });
    requestAnimationFrame(() => feedback.current?.focus());
  };
  const retry = (moduleId: string) => {
    if (!course) return;
    const module = course.modules.find(item => item.id === moduleId);
    if (!module) return;
    store.dispatch({ type: "retry", courseId: course.id, moduleId });
    setFeedbackPulse(null);
    const question = moduleQuestions(module)[0];
    requestAnimationFrame(() => {
      if (question) document.getElementById(`${course.id}-${module.id}-${question.id}-0`)?.focus();
    });
  };
  if (route.error || !course || !allowed || !active) return <div className="dojo-page-shell"><DojoPageHeader brand={brand} currentPage="dojo" /><main id="training-content" className="training-unavailable pixel-frame" tabIndex={-1}><p className="eyebrow">THE TRAINING PATH</p><h1 ref={headingRef} tabIndex={-1}>{route.error ? "TRAINING LINK NOT FOUND." : course?.availability === "planned" ? "STILL IN DEVELOPMENT." : "ONE STEP BEFORE THIS ONE."}</h1><p>{route.error ?? (course?.availability === "planned" ? `${course.title} is part of the planned path. No training or XP is available for this course yet.` : "Complete the prerequisite practice before opening this course.")}</p>{!route.error && course?.availability === "available" && <ul className="training-prerequisites">{course.prerequisites.map(id => courseCatalog.courses.find(item => item.id === id)!).filter(item => !courseComplete(snapshot.data, item)).map(item => <li key={item.id}><a href={trainingHref(item.id)}>COMPLETE: {item.title} <span aria-hidden="true">➜</span></a></li>)}</ul>}<div className="practice-actions"><a className="pixel-button" href="#my-dojo">OPEN MY DOJO <span aria-hidden="true">➜</span></a><a className="pixel-button pixel-button-light" href="#belts">EXPLORE THE BELTS</a></div></main><DojoPageFooter /></div>;

  const data = snapshot.data;
  const xp = courseXp(data, course), maxXp = courseMaxXp(course);
  const complete = completedModules(data, course);
  const index = course.modules.indexOf(active);
  const previous = course.modules[index - 1], next = course.modules[index + 1];
  const belt = belts.find(item => item.id === course.belt)!;
  return <div className="training-shell">
    <DojoPageHeader brand={brand} currentPage="dojo" />
    <main className="training-main" id="training-content" tabIndex={-1}>
      <nav className="training-breadcrumb" aria-label="Training location"><a href="#my-dojo">MY DOJO</a><span aria-hidden="true">/</span><a href={`#belts/${course.belt}`}>{belt.name.toUpperCase()} BELT</a></nav>
      <div className="training-intro"><div><p className="eyebrow">{belt.name.toUpperCase()} BELT / YOUR PRACTICE</p><h1 ref={headingRef} tabIndex={-1}>{course.title}</h1><p>{course.summary}</p></div><AnimatedFighter className="training-fighter" role="training" /></div>
      <div className="practice-progress"><span>{complete.length} / {course.modules.length} complete</span><Progress value={course.modules.length ? complete.length / course.modules.length * 100 : 0} aria-label="Course completion" /><strong>{xp} / {maxXp} XP</strong></div>
      <p className="training-step-label">STEP {index + 1} OF {course.modules.length} <span>{active.title}</span></p>
      <Tabs value={active.id} onValueChange={value => { window.location.hash = trainingHref(course.id, value); }} className="training-tabs">
        <TabsList aria-label="Training modules">{course.modules.map((module, i) => <TabsTrigger value={module.id} key={module.id}>{String(i + 1).padStart(2, "0")} {module.title} {moduleProgress(data, course, module).completed ? "✓" : ""}</TabsTrigger>)}</TabsList>
        {course.modules.map(module => {
          const progress = moduleProgress(data, course, module);
          const grade = gradeModule(module, progress);
          const missed = moduleQuestions(module).filter(question => progress.answers[question.id] !== String(question.correct));
          const setAnswer = (questionId: string, answer: string) => store.dispatch({ type: "answer", courseId: course.id, moduleId: module.id, questionId, answer });
          return <TabsContent value={module.id} key={module.id}><section className="practice-card pixel-frame">
            <p className="eyebrow">{module.kind === "warmup" ? "A QUICK WIN" : module.kind === "lesson" ? "BITE-SIZED LESSON" : "KNOWLEDGE CHECK"} · {module.reward} XP / COUNTED ONCE</p><h2>{module.intro}</h2>
            {module.kind === "warmup" ? <><div className="sample-message"><span>FROM: {module.scenario.from}</span><strong>{module.scenario.title}</strong><p>{module.scenario.body}</p><span className="sample-link">[ {module.scenario.action} ]</span><small>Training example — no real link.</small></div><h3>{module.question.prompt}</h3><Choices question={module.question} name={`${course.id}-${module.id}-${module.question.id}`} value={progress.answers[module.question.id]} onChange={answer => setAnswer(module.question.id, answer)} /></> : module.kind === "lesson" ? <>{module.lead && <p>{module.lead}</p>}<div className="lesson-moves">{module.sections.map((section, i) => <article key={i}><span>{String(i + 1).padStart(2, "0")}</span><div><h3>{section.title}</h3><p>{section.body}</p></div></article>)}</div>{module.note && <aside className="lesson-note"><strong>{module.note.title}</strong><p>{module.note.body}</p></aside>}</> : <><p className="quiz-instructions">{module.questions.length} questions. {module.passingScore} correct to complete this step. Take your time; you can retry.</p>{module.questions.map((question, i) => <fieldset className="quiz-question" key={question.id}><legend><span>{String(i + 1).padStart(2, "0")}</span> {question.prompt}</legend><Choices question={question} name={`${course.id}-${module.id}-${question.id}`} value={progress.answers[question.id]} onChange={answer => setAnswer(question.id, answer)} disabled={progress.submitted} />{progress.submitted && <p className={`question-feedback ${progress.answers[question.id] === String(question.correct) ? "correct" : ""}`}><strong>{progress.answers[question.id] === String(question.correct) ? "✓ Correct. " : "Keep practicing. "}</strong>{question.explanation}</p>}</fieldset>)}</>}
            {module.kind !== "lesson" && progress.submitted && <div ref={module.id === active.id ? feedback : undefined} tabIndex={-1} role="status" className={`feedback ${grade.passed ? `success ${feedbackPulse === module.id ? "reward-feedback" : ""}` : ""}`}><strong>{module.kind === "warmup" ? grade.passed ? `Good instinct. ${module.reward} XP counted once.` : "Pause and try again." : `${grade.correct} / ${grade.total}. ${grade.passed ? `Practice passed. ${module.reward} XP counted once.` : "Review and try again."}`}</strong>{module.kind === "warmup" ? <p>{module.question.explanation}</p> : <><p>{grade.passed ? "Keep the habit: practice, verify and protect." : `You need ${module.passingScore} correct answers for this step. XP already earned is never counted again.`}</p>{missed.length > 0 && <div className="quiz-review"><h3>YOUR NEXT ROUND</h3><p>Revisit these questions:</p><ul>{missed.map(question => <li key={question.id}>{question.prompt}</li>)}</ul></div>}</>}</div>}
            <div className="practice-actions">{module.kind === "lesson" ? <button type="button" className="pixel-button" disabled={progress.completed} onClick={() => store.dispatch({ type: "complete-lesson", courseId: course.id, moduleId: module.id })}>{progress.completed ? "LESSON COMPLETE ✓" : "MARK LESSON COMPLETE"}</button> : module.kind === "quiz" && progress.submitted ? <button type="button" className="pixel-button pixel-button-light" onClick={() => retry(module.id)}>PRACTICE AGAIN</button> : <button type="button" className="pixel-button" disabled={grade.answered !== grade.total} onClick={check}>{progress.submitted ? "CHECK AGAIN" : module.kind === "quiz" ? "CHECK MY ANSWERS" : "CHECK ANSWER"}</button>}</div>
          </section></TabsContent>;
        })}
      </Tabs>
      <nav className="training-step-nav" aria-label="Previous and next training step"><a href={previous ? trainingHref(course.id, previous.id) : "#my-dojo"} className="pixel-button pixel-button-light">← {previous ? "PREVIOUS STEP" : "MY DOJO"}</a><a href={next ? trainingHref(course.id, next.id) : "#my-dojo"} className="pixel-button">{next ? "NEXT STEP" : "VIEW MY PROGRESS"} <span aria-hidden="true">➜</span></a></nav>
      {courseComplete(data, course) && <div className="practice-complete" role="status"><strong>PRACTICE COMPLETE</strong><p>{xp} XP. All {course.modules.length} steps counted once.</p><a href="#my-dojo">SEE YOUR NEXT MOVE <span aria-hidden="true">➜</span></a></div>}
      <p className="session-note">Progress saves on this browser when storage is available. Completing a pilot is not a full belt award or certification.</p>
    </main><DojoPageFooter />
  </div>;
}
