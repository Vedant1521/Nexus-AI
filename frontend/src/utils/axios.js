import axios from "axios";
import { store } from "../redux/store";
import { clearAuth } from "../redux/user.slice";

const api = axios.create({

 baseURL:
 import.meta.env.VITE_SERVER_URL,

 withCredentials:true

});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const { userData } = store.getState().user;
      if (userData && window.location.pathname !== "/login") {
        store.dispatch(clearAuth());
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;