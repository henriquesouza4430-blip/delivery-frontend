// Backend configurado via .env
const LOCAL_BACKEND = "http://localhost:3001";

const backend =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
  LOCAL_BACKEND;

export const apiBaseUrl = `${backend}/api`;
export const socketBaseUrl = backend;

export const frontendBaseUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  "http://localhost:3000";