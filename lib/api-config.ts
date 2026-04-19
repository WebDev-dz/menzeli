import { Configuration } from "@/api";


export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://menzili-utx2r.sevalla.app"
export const apiConfig = new Configuration({
  basePath: `${API_URL}/api`,
  accessToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  },
});
