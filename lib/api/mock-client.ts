import axios from "axios";

// MockAPI Base URL from user request
const MOCK_API_URL = "https://69ba4aeab3dcf7e0b4bc7148.mockapi.io";

const mockClient = axios.create({
  baseURL: MOCK_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for basic error handling
mockClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ MockAPI Error:", {
        status: error.response?.status,
        message: error.response?.data || error.message,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export default mockClient;
