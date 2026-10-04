import rawCatalog from "../data/courses.json";
import { validateCatalog } from "./course-engine";

export const courseCatalog = validateCatalog(rawCatalog);
export const PILOT_ID = "white-phishing-pilot";
export const pilotCourse = courseCatalog.courses.find(course => course.id === PILOT_ID)!;
