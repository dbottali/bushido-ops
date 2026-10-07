export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function databaseError(message: string): ApiError {
  const messages: Record<string, [number, string]> = {
    REVISION_CONFLICT: [409, "This step changed on another device. Refresh it before continuing."],
    CATALOG_CONFLICT: [409, "The catalog changed. Reload it before publishing."],
    CONTENT_IN_USE: [409, "A published course already has learner progress. Keep it and add a new course ID for revised training."],
    ACCOUNT_REQUIRED: [401, "Sign in to continue your free White training."],
    SUBSCRIPTION_REQUIRED: [403, "An active subscription is required for this belt."],
    WHITE_REQUIRED: [403, "Earn your White belt before starting premium training."],
    PREREQUISITE_REQUIRED: [403, "Complete the prerequisite course first."],
    PREVIOUS_STEP_REQUIRED: [403, "Complete the previous steps first."],
    COURSE_UNAVAILABLE: [404, "This course is still in development."],
    STEP_NOT_FOUND: [404, "This training step could not be found."],
    RETRY_REQUIRED: [409, "Choose Practice again before changing submitted answers."],
    INVALID_ANSWERS: [400, "Answer every question using one of the available choices."],
    ALREADY_IMPORTED: [409, "This account already imported a guest preview."],
  };
  for (const [code, [status, description]] of Object.entries(messages)) if (message.includes(code)) return new ApiError(status, code, description);
  return new ApiError(503, "SERVICE_UNAVAILABLE", "The dojo service is temporarily unavailable. Your saved answers are safe; try again shortly.");
}
