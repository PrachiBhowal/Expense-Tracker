import axiosInstance from './client';

const BASE = '/expenses';

export const getExpenses = (params) => axiosInstance.get(BASE, { params });
export const createExpense = (data) => axiosInstance.post(BASE, data);
export const updateExpense = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);
export const deleteExpense = (id) => axiosInstance.delete(`${BASE}/${id}`);