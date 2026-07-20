import axios from "axios";

// Set global defaults so the XSRF-TOKEN cookie is sent on all requests
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

export default api;