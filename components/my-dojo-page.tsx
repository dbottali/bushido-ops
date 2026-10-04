"use client";

import type { ReactNode, RefObject } from "react";
import { DojoPageHeader, DojoPageFooter } from "@/components/dojo-page-chrome";
import { AnimatedFighter } from "@/components/animated-fighter";
import { DojoArt } from "@/components/dojo-art";
import { Progress } from "@/components/ui/progress";
import { ProgressManager } from "@/components/progress-manager";
import { courseCatalog } from "@/lib/course-catalog";
import { canTrain, completedModules, courseMaxXp, courseStatus, courseXp, learningSummary, moduleProgress, moduleQuestions, nextCourseModule, resumeTarget, statusLabels, trainingHref } from "@/lib/course-engine";
import { belts } from "@/lib/dojo-content";
import { principles } from "@/lib/philosophy-content";
import type { ProgressSnapshot, ProgressStore } from "@/lib/dojo-progress";

export function MyDojoPage({ brand, headingRef, store, snapshot }: { brand: ReactNode; headingRef: RefObject<HTMLHeadingElement | null>; store: ProgressStore; snapshot: ProgressSnapshot }) {
  const data = snapshot.data, summary = learningSummary(data, courseCatalog);
  const available = courseCatalog.courses.filter(course => course.availability === "available");
  const planned = courseCatalog.courses.filter(course => course.availability === "planned");
  const target = resumeTarget(data, courseCatalog);
  const nextCourse = courseCatalog.courses.find(course => course.id === target?.courseId);
  const nextModule = nextCourse?.modules.find(module => module.id === target?.moduleId);
  const reviewed = available.flatMap(course => course.modules.flatMap(module => {
    const progress = moduleProgress(data, course, module);
    return progress.submitted ? moduleQuestions(module).filter(question => progress.answers[question.id] !== String(question.correct)).map(question => ({ course, module, question })) : [];
  }));
  const allComplete = summary.availableCourses > 0 && summary.completedCourses === summary.availableCourses;
  return <div className="dojo-page-shell my-dojo-shell">
    <DojoPageHeader brand={brand} currentPage="my-dojo" />
    <main id="my-dojo-content" tabIndex={-1} className="my-dojo-main">
      <section className="my-dojo-intro"><div><p className="eyebrow">MY DOJO / YOUR PERSONAL PATH</p><h1 ref={headingRef} tabIndex={-1}>YOUR PRACTICE.<br />YOUR PACE.</h1><p>No streaks to chase. One useful step at a time.</p><span className="my-dojo-storage">{snapshot.mode === "saved" ? "SAVED ON THIS BROWSER" : snapshot.mode === "protected" ? "SAVED COPY PROTECTED" : "TEMPORARY PRACTICE SESSION"}</span></div><a href="#my-dojo/backups" className="about-text-link">MANAGE BACKUPS <span aria-hidden="true">↓</span></a></section>
      <div className="my-dojo-stats" aria-label="Available training progress"><article className="pixel-frame"><span>TRAINING XP</span><strong>{summary.xp}<small> / {summary.maxXp}</small></strong></article><article className="pixel-frame"><span>PRACTICES COMPLETE</span><strong>{summary.completedCourses}<small> / {summary.availableCourses}</small></strong></article><article className="pixel-frame"><span>STEPS COMPLETE</span><strong>{summary.completedModules}<small> / {summary.totalModules}</small></strong></article><article className="pixel-frame"><span>DOJO-CODE HABITS</span><strong>{data.commitments.length}<small> / {principles.length}</small></strong></article></div>
      <section className="my-dojo-next pixel-frame" aria-labelledby="my-dojo-next-title"><div><p className="eyebrow">YOUR NEXT MOVE</p><h2 id="my-dojo-next-title">{allComplete ? "A USEFUL HABIT. KEEP IT SHARP." : nextCourse?.title ?? "THE PATH IS TAKING SHAPE."}</h2><p>{allComplete ? "You completed every available practice. Revisit a step or review your last answers. Future courses remain in development." : nextModule ? `${nextModule.title} is your first incomplete step in this practice.` : "New practice will appear here when it is ready."}</p>{target && <a className="pixel-button" href={trainingHref(target.courseId, target.moduleId)}>{allComplete ? "REVISIT TRAINING" : summary.completedModules || available.some(course => courseStatus(data, course, courseCatalog) === "in-progress") ? "CONTINUE TRAINING" : "START TRAINING"} <span aria-hidden="true">➜</span></a>}<div className="my-dojo-overall"><Progress value={summary.maxXp ? summary.xp / summary.maxXp * 100 : 0} aria-label="Available training XP" /><span>{summary.xp} / {summary.maxXp} XP · Available practice only</span></div></div><div className="my-dojo-guardian" aria-hidden="true"><AnimatedFighter role="training" className="my-dojo-fighter" /><span>PAUSE.<br />VERIFY.<br />PROTECT.</span></div></section>
      <section className="my-dojo-courses" aria-labelledby="my-dojo-courses-title"><div className="belts-section-title"><p className="eyebrow">AVAILABLE PRACTICE</p><h2 id="my-dojo-courses-title">ONE PRACTICE. ONE CLEAR NEXT STEP.</h2><p>Completion and rewards follow the course rules, not a visit to a page.</p></div><div className="my-dojo-course-grid">{available.map(course => {
        const status = courseStatus(data, course, courseCatalog), done = completedModules(data, course).length;
        const first = nextCourseModule(data, course), belt = belts.find(item => item.id === course.belt)!;
        return <article className={`my-dojo-course pixel-frame status-${status}`} key={course.id}><div className="my-dojo-course-top"><p className="eyebrow">{belt.name.toUpperCase()} BELT</p><span className="course-status">{statusLabels[status]}</span></div><h3>{course.title}</h3><p>{course.summary}</p><div className="my-dojo-course-progress"><span>{done} / {course.modules.length} steps</span><strong>{courseXp(data, course)} / {courseMaxXp(course)} XP</strong></div><Progress value={done / course.modules.length * 100} aria-label={`${course.title} completion`} /><ol>{course.modules.map(module => <li key={module.id}><a href={trainingHref(course.id, module.id)} aria-label={`${module.title} in ${course.title}`}><span>{moduleProgress(data, course, module).completed ? "✓" : "□"}</span>{module.title}<small>{module.reward} XP</small></a></li>)}</ol><a className="pixel-button pixel-button-light" href={canTrain(data, course, courseCatalog) && first ? trainingHref(course.id, first.id) : trainingHref(course.id)}>{status === "completed" ? "REVISIT PRACTICE" : status === "locked" ? "VIEW PREREQUISITES" : status === "in-progress" ? "CONTINUE PRACTICE" : "START PRACTICE"} <span aria-hidden="true">➜</span></a></article>;
      })}</div></section>
      {reviewed.length > 0 && <section className="my-dojo-review pixel-frame" aria-labelledby="my-dojo-review-title"><p className="eyebrow">YOUR LAST ATTEMPT</p><h2 id="my-dojo-review-title">A FEW THINGS TO REVISIT.</h2><p>These answers need another look. No XP is removed for practicing again.</p><ul>{reviewed.map(({ course, module, question }) => <li key={`${course.id}-${module.id}-${question.id}`}><a href={trainingHref(course.id, module.id)}>{question.prompt}<span>{module.title} <span aria-hidden="true">➜</span></span></a></li>)}</ul></section>}
      {planned.length > 0 && <details className="my-dojo-planned"><summary>{planned.length} COURSES IN DEVELOPMENT <span aria-hidden="true">+</span></summary><p>Not playable yet. XP does not unlock missing content.</p><div className="my-dojo-planned-grid">{planned.map(course => { const belt = belts.find(item => item.id === course.belt)!; return <article key={course.id}><DojoArt x={belt.x} y={637} w={76} h={73} /><div><span className="course-status">IN DEVELOPMENT</span><h3>{course.title}</h3><p>{course.summary}</p><a href={`#belts/${course.belt}`}>EXPLORE {belt.name.toUpperCase()} BELT <span aria-hidden="true">➜</span></a></div></article>; })}</div></details>}
      <section id="my-dojo-backups" className="my-dojo-backups pixel-frame" aria-labelledby="my-dojo-backups-title"><p className="eyebrow">YOUR DATA / YOUR CHOICE</p><h2 id="my-dojo-backups-title" tabIndex={-1}>KEEP YOUR PATH WITH YOU.</h2><ProgressManager store={store} snapshot={snapshot} /></section>
      <p className="my-dojo-note">Browser-local progress. No account or automatic device sync. A completed pilot is not a full belt award or certification. <a href="#philosophy/code">REVISIT YOUR DOJO CODE ➜</a></p>
    </main><DojoPageFooter />
  </div>;
}
