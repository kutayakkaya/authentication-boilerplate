import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001",
    withCredentials: true
});

export default apiClient;
