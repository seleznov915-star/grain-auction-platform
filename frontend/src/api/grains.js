import axios from "axios";
const API = process.env.REACT_APP_BACKEND_URL;
const API_URL = "https://grain-auction-platform.onrender.com/api";


export const fetchGrains = async () => {
  try {
    const response = await axios.get(`${API}/grains`);
    return response.data;
  } catch (error) {
    console.error("Error fetching grains:", error);
    throw error;
  }
};
