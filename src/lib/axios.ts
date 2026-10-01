import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL ?? "/api",
});

export default api;
