import api from './api';



export const adminApi = {
    dashboard() {
        return api.get('/admin/dashboard');
    },



    patients(params = {}){
        return api.get('/admin/patients', { params });
    },


    deletePatient(id){
        return api.delete(`/admin/patients/${id}`);

    },


    doctors(params ={}){
        return api.get('/admin/doctors', { params });
    },



    createDoctor(payload){
        return api.post('/admin/doctors', payload);
    },

    getCities() {
    return api.get('/admin/cities');
  },

  getSpecialties() {
    return api.get('/admin/specialties');
  },


    createAdmin(payload){
        return api.post('/admin/Add_admin', payload);


    },

    createCity(payload) {
    return http.post('/admin/Addcities', payload);
  },

  createSpecialty(payload) {
    return api.post('/admin/Addspecialties', payload);
  },

  updateMe(payload) {
    return api.patch('/admin/me', payload);
  },

  changePassword(payload) {
    return api.put('/admin/password', payload);
  },

  reviews(params = {}) {
    return api.get('/admin/reviews', { params });
  },


  deleteReview(id) {
    return api.delete(`/admin/reviews/${id}`);
  }





}