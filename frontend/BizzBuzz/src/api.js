const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const apiUrl = (path) => `${BASE_URL}${path}`;
