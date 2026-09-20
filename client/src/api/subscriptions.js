import axiosInstance from './client';

const BASE = '/subscriptions';

export const getSubscriptions = () => axiosInstance.get(BASE);
export const createSubscription = (data) => axiosInstance.post(BASE, data);
export const chargeSubscription = (id) => axiosInstance.post(`${BASE}/${id}/charge`);
export const deleteSubscription = (id) => axiosInstance.delete(`${BASE}/${id}`);
