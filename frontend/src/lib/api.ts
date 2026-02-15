/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

let setLoadingGlobal: ((loading: boolean) => void) | null = null;

export const setLoadingHandler = (handler: (loading: boolean) => void) => {
  setLoadingGlobal = handler;
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    if (setLoadingGlobal) setLoadingGlobal(true);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.access_token = token;
    }
    return config;
  },
  (error) => {
    if (setLoadingGlobal) setLoadingGlobal(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (setLoadingGlobal) setLoadingGlobal(false);
    return response;
  },
  (error) => {
    if (setLoadingGlobal) setLoadingGlobal(false);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const User = {
  getStudent: () => api.get('/user/student'),
  getFaculty: () => api.get('/user/faculty'),
  getById: (id: string) => api.get('/user/' + id),
  getMyself: () => api.get('/user/me/detail'),
  updateMyself: (data: any) => api.put('/user/me/update', data)
}

export const Auth = {
  sendOtpForgotPassword: (data: any) => api.post("/auth//otp/forgot-password", data),
  changePassword: (data: any) => api.put("/auth/forgot-password", data),
  updatePassword: (data: any) => api.put("/auth/update-password", data),
  logout: () => api.put('/auth/logout'),
}

export const Channel = {
  create: (data: any) => api.post("/channel/create", data),
  sendInvite: (data: any) => api.post("/channel/send-invite", data),
  getFacultyChannel: () => api.get("/channel/faculty/my-channel"),
  getStudentChannel: () => api.get("/channel/student/my-channel"),
  getExploreChannel: ()=> api.get("/channel/student/explore"),
  getById: (id: string) => api.get("/channel/" + id),
  addTeamMember: (id: string) => api.put("/channel/add/" + id),
  exitTeamMember: (id: string) => api.put("/channel/exit/" + id),
  update: (id: string, data: any) => api.put("/channel/update/" + id, data),
  delete: (id: string) => api.delete("/channel/delete/" + id)
}

export const Discussion = {
  getMessages: (channelId: string) => api.get("/discussion/" + channelId),
  sendMessage: (channelId: string, message: string) => api.post("/discussion/" + channelId, { message })
}

export default api;