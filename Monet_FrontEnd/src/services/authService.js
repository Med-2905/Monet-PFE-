import api from "./api";

const authService = {
  login(payload) {
    return api.post("/auth/login", payload).then((response) => response.data);
  },

  register(payload) {
    return api.post("/auth/register", payload).then((response) => response.data);
  },

  me() {
    return api.get("/auth/me").then((response) => response.data);
  },

  refresh() {
    return api.post("/auth/refresh").then((response) => response.data);
  },

  logout() {
    return api.post("/auth/logout").then((response) => response.data);
  },
};

export default authService;