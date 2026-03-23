import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Locations
export const fetchDistricts = () => API.get('/districts');
export const fetchHospitals = (district) => API.get(`/hospitals${district ? `?district=${district}` : ''}`);
export const createHospital = (data) => API.post('/hospitals', data);
export const deleteHospital = (id) => API.delete(`/hospitals/${id}`);

// Doctors
export const fetchDoctors = (params) => API.get('/doctors', { params });
export const addDoctor = (data) => API.post('/doctors', data);
export const deleteDoctor = (id) => API.delete(`/doctors/${id}`);

// Patients
export const fetchPatients = () => API.get('/users/patients');
export const deletePatient = (id) => API.delete(`/users/patients/${id}`);

// Appointments
export const bookAppointment = (data) => API.post('/appointments', data);
export const getUserAppointments = () => API.get('/appointments/user');
export const getAllAppointments = () => API.get('/appointments');
export const updateAppointmentStatus = (id, status) =>
    API.patch(`/appointments/${id}/status`, { status });
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);

// Live Places (Nominatim + Overpass)
export const fetchLiveHospitals = (district) => API.get(`/places/hospitals?district=${encodeURIComponent(district)}`);

// Notifications
export const fetchNotifications = () => API.get('/notifications');
export const fetchUnreadCount = () => API.get('/notifications/unread-count');
export const markNotificationsRead = () => API.patch('/notifications/mark-read');

// Chatbot
export const getChatbotSuggestion = (message, age, gender) => API.post('/chatbot/suggest-doctor', { message, age, gender });

export default API;
