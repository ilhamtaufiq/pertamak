const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";
const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || "Pertamak";
const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || "local";

export const APP_CONFIG = {
  API_URL,
  APP_NAME,
  APP_ENV,
  // Add more config here
};

export default APP_CONFIG;
