import axios from 'axios';

const api = axios.create({ baseURL: 'https://clubreport.parameedev.online/api' });

export const getSubjectGroups = () => api.get('/subject-groups').then(r => r.data);
export const createSubjectGroup = (name) => api.post('/subject-groups', { name }).then(r => r.data);
export const deleteSubjectGroup = (id) => api.delete(`/subject-groups/${id}`).then(r => r.data);

export const getTeachers = (subjectGroupName) =>
  api.get('/teachers', { params: subjectGroupName ? { subjectGroupName } : {} }).then(r => r.data);
export const getSubjectGroupsFromTeachers = () =>
  api.get('/teachers/subject-groups').then(r => r.data);
export const getClubNames = (subjectGroupName) =>
  api.get('/teachers/clubs', { params: subjectGroupName ? { subjectGroupName } : {} }).then(r => r.data);
export const getTeacher = (id) => api.get(`/teachers/${id}`).then(r => r.data);
export const createTeacher = (data) => api.post('/teachers', data).then(r => r.data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data).then(r => r.data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`).then(r => r.data);

export const getReports = (params = {}) =>
  api.get('/reports', { params }).then(r => r.data);
export const getReport = (id) => api.get(`/reports/${id}`).then(r => r.data);
export const createReport = (formData) =>
  api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const updateReport = (id, formData) =>
  api.put(`/reports/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const deleteReport = (id) => api.delete(`/reports/${id}`).then(r => r.data);

export const getNotifyEnabled = () => api.get('/settings/notify-enabled').then(r => r.data);
export const setNotifyEnabled = (enabled) => api.post('/settings/notify-enabled', { enabled }).then(r => r.data);

export const registerFcmToken = (teacherId, token) =>
  api.post(`/teachers/${teacherId}/fcm-token`, { token }).then(r => r.data);
