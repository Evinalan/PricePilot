
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://pricepilot-bu1w.onrender.com/api"
).replace(/\/$/, "");

export const registerUser = async (userData) => {
  const response = await axios.post(
    `${API_URL}/auth/register`,
    userData
  );

  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    userData
  );

  return response.data;
};
