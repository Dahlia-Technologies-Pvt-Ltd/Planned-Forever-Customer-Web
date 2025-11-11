import axios from "axios";
import { loginBaseUrl, baseUrl, qrCodesBaseUrl } from "../utilities/config";

// Interceptor function for dynamic baseURL instance
const setupDynamicInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const isMobile = localStorage.getItem("mobile");
      // Dynamically set baseURL based on the request type
      if (config.url.includes("login")) {
        config.baseURL = loginBaseUrl;
      } else if (config.url.includes("send_otp")) {
        config.baseURL = loginBaseUrl;
      } else if (isMobile) {
        config.baseURL = loginBaseUrl;
      } else {
        config.baseURL = baseUrl;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      let errorMessage;

      console.log({ error });

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Unauthorized access. Please login again.";
            break;
          case 404:
            errorMessage = "Resource not found";
            break;
          case 500:
            errorMessage = "Internal server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.message || "An error occurred";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "An unknown error occurred";
      }

      return Promise.reject(new Error(errorMessage));
    },
  );
};

// Create axios instance without initial baseURL (will be set dynamically)
const instance = axios.create({
  timeout: 10000,
});

// Setup interceptors
setupDynamicInterceptors(instance);

// Interceptor function for QR codes instance (API key)
const setupQrCodesInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const userData = JSON.parse(localStorage.getItem("eventDetail"));
      if (userData) {
        config.headers["Auth-Token"] = userData?.qr_token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      let errorMessage;

      console.log({ error });

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Invalid API key";
            break;
          case 404:
            errorMessage = "Resource not found";
            break;
          case 500:
            errorMessage = "Internal server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.message || "An error occurred";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "An unknown error occurred";
      }

      return Promise.reject(new Error(errorMessage));
    },
  );
};

// QR Codes axios instance
const qrCodesInstance = axios.create({
  baseURL: qrCodesBaseUrl,
  timeout: 10000,
});

// Setup interceptors for QR codes instance
setupQrCodesInterceptors(qrCodesInstance);

// Export both instances
export { instance as axios, qrCodesInstance as qrCodesAxios };
