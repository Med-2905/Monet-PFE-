import api from "../services/api.js";

export const doctorApi = {
  me() {
    return api.get("/doctor/me").then((res) => res.data);
  },

  getCities(params = {}) {
    return api.get("/doctor/cities", { params }).then((res) => res.data);
  },

  getSpecialties(params = {}) {
    return api.get("/doctor/specialties", { params }).then((res) => res.data);
  },

  dashboard() {
    return api.get("/doctor/dashboard").then((res) => res.data);
  },

  updateProfile(payload) {
    return api.put("/doctor/profile", payload).then((res) => res.data);
  },

  updatePassword(payload) {
    return api.put("/doctor/change-password", payload).then((res) => res.data);
  },

  getAppointments(params = {}) {
    return api.get("/doctor/RDVS", { params }).then((res) => res.data);
  },

  confirmAppointment(rdvId) {
    return api.patch(`/doctor/appointments/${rdvId}/confirm`).then((res) => res.data);
  },

  cancelAppointment(rdvId, payload = {}) {
    return api.patch(`/doctor/appointments/${rdvId}/cancel`, payload).then((res) => res.data);
  },

  completeAppointment(rdvId) {
    return api.patch(`/doctor/appointments/${rdvId}/complete`).then((res) => res.data);
  },

  markNoShow(rdvId) {
    return api.patch(`/doctor/appointments/${rdvId}/no-show`).then((res) => res.data);
  },

  getUnavailableDays() {
    return api.get("/doctor/unavailable-days").then((res) => res.data);
  },

  addUnavailableDay(payload) {
    return api.post("/doctor/unavailable-days", payload).then((res) => res.data);
  },

  deleteUnavailableDay(dayId) {
    return api.delete(`/doctor/unavailable-days/${dayId}`).then((res) => res.data);
  },

  createOrdonnance(rdvId, payload) {
    return api.post(`/doctor/appointments/${rdvId}/ordonnance`, payload).then((res) => res.data);
  },

  createOrdonnance(rdvId, payload) {
  return api
    .post(`/doctor/appointments/${rdvId}/ordonnance`, payload)
    .then((res) => res.data);
},
getOrdonnances(params = {}) {
  return api.get("/doctor/ordonnances", { params }).then((res) => res.data);
},

  getReviews(params = {}) {
    return api.get("/doctor/reviews", { params }).then((res) => res.data);
  },

  createMedicalRecord(rdvId, payload) {
  return api
    .post(`/doctor/appointments/${rdvId}/medical-record`, payload)
    .then((res) => res.data);
},

updateMedicalRecord(recordId, payload) {
  return api
    .patch(`/doctor/medical-records/${recordId}`, payload)
    .then((res) => res.data);
},

getPatientMedicalHistory(patientId) {
  return api
    .get(`/doctor/patients/${patientId}/medical-history`)
    .then((res) => res.data);
},


getPatients(params = {}) {
  return api.get("/doctor/patients", { params }).then((res) => res.data);
},
};