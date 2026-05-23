import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8082/api',
});

// 멤버
export const createMember = (name, profileColor) =>
    api.post('/members', { name, profileColor });

export const getMembers = () =>
    api.get('/members');