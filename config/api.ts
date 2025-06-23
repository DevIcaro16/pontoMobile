import axios from "axios";

const api = axios.create({
    // baseURL: "http://10.0.0.104:3232",
    baseURL: "https://api-ponto.vercel.app",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;