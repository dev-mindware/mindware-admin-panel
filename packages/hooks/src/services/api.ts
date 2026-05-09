import axios from "axios";

export const api = axios.create({
  baseURL: typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : "",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
