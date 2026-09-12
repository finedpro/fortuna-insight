/** Server-side only — where the real Fortuna backend is running. Configurable so the backend doesn't have to run on a fixed port. */
export const BACKEND_BASE_URL = process.env.FORTUNA_API_BASE_URL ?? "http://localhost:4000";
