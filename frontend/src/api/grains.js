import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;  // http://192.168.0.116:8000

export const fetchGrains = async () => {
  try {
    const response = await axios.get(`${API}/grains`);
    return response.data;
  } catch (error) {
    console.error("Error fetching grains:", error);
    throw error;
  }
};
