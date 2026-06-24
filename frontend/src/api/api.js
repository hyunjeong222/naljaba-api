import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8082/api',
});

export const getConfirmedDate = () => 
    api.get('/dates/confirmed');

// 멤버
export const createMember = (name, profileColor) =>
    api.post('/members', { name, profileColor });

export const getMembers = () =>
    api.get('/members');

// 날짜
export const saveDates = (memberId, dates) =>
    api.post(`/dates/${memberId}`, { dates });

export const getDates = (memberId) =>
    api.get(`/dates/${memberId}`);

export const getDateResults = () => 
    api.get('/dates/results');

export const confirmDate = (memberId, date) =>
    api.post(`/dates/confirm/${memberId}`, { date });

export const resetConfirmedDate = () =>
    api.delete('/dates/confirmed');
