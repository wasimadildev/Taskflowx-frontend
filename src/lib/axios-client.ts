import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

const API = axios.create(options);

// Add a request interceptor to ensure credentials are always sent
API.interceptors.request.use(function (config) {
  config.withCredentials = true;
  return config;
}, function (error) {
  return Promise.reject(error);
});

// Add a response interceptor
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (!error.response) {
      console.error("Network error or server not responding", error);
      return Promise.reject({
        ...error,
        errorCode: "NETWORK_ERROR"
      });
    }

    const { data, status } = error.response;

    // If unauthorized, redirect to login page
    if ((data === "Unauthorized" || status === 401) && window.location.pathname !== "/") {
      console.log("Unauthorized access, redirecting to login page");
      window.location.href = "/";
      return Promise.reject(error);
    }

    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;
