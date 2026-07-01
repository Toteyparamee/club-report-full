import axios from 'axios';

const api = axios.create({ baseURL: 'https://clubreport.parameedev.online/api' });

export const getTeachers = (subjectGroupName) =>
  api.get('/teachers', { params: subjectGroupName ? { subjectGroupName } : {} }).then(r => r.data);
export const getTeacher = (id) => api.get(`/teachers/${id}`).then(r => r.data);
export const createTeacher = (data) => api.post('/teachers', data).then(r => r.data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data).then(r => r.data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`).then(r => r.data);

export const getReports = (params = {}) =>
  api.get('/reports', { params }).then(r => r.data);
export const deleteReport = (id) => api.delete(`/reports/${id}`).then(r => r.data);

export const getNotifyEnabled = () => api.get('/settings/notify-enabled').then(r => r.data);
export const setNotifyEnabled = (enabled) => api.post('/settings/notify-enabled', { enabled }).then(r => r.data);
