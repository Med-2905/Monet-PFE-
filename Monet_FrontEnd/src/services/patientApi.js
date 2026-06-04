import api from "../services/api.js";

export const patientApi = {
  profile() {
    return api.get("/patient/profile").then((res) => res.data);
  },

  updateProfile(payload) {
    return api.put("/patient/profile", payload).then((res) => res.data);
  },

  updatePassword(payload) {
    return api.put("/patient/password", payload).then((res) => res.data);
  },

  getDoctors(params = {}) {
    return api.get("/patient/doctors", { params }).then((res) => res.data);
  },

  getCities(params = {}) {
  return api.get("/patient/cities", { params }).then((res) => res.data);
},

getSpecialties(params = {}) {
  return api.get("/patient/specialties", { params }).then((res) => res.data);
},

  reserveAppointment(doctorId, payload) {
    return api.post(`/patient/doctors/${doctorId}/rdv`, payload).then((res) => res.data);
  },

  getAppointments(params = {}) {
    return api.get("/patient/rdvs", { params }).then((res) => res.data);
  },

  getAppointmentStatus(rdvId) {
    return api.get(`/patient/rdvs/${rdvId}/status`).then((res) => res.data);
  },

  getHistory(params = {}) {
    return api.get("/patient/rdvs/history", { params }).then((res) => res.data);
  },

  cancelAppointment(rdvId, payload = {}) {
    return api.post(`/patient/rdvs/${rdvId}/cancel`, payload).then((res) => res.data);
  },

  getOrdonnances(params = {}) {
    return api.get("/patient/ordonnances", { params }).then((res) => res.data);
  },

  addReview(rdvId, payload) {
    return api.post(`/patient/rdvs/${rdvId}/review`, payload).then((res) => res.data);
  },
};