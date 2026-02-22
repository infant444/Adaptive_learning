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

export const Exam = {
  generate: (data: FormData) => api.post("/exam/generate", data),
  create: (data: any) => api.post("/exam/create", data),
  getFaculty: () => api.get("/exam/faculty"),
  getFacultyByID: (id:string) => api.get("/exam/faculty/"+id),
  getMy: () => api.get("/exam/my"),
  updateDetail: (examId: string, data: any) => api.put("/exam/update/detail/" + examId, data),
  updateQuestion: (examId: string, data: any) => api.put("/exam/update/question/" + examId, data),
  delete: (examId: string) => api.delete("/exam/delete/" + examId),
  getById: (examId: string) => api.get("/exam/detail/" + examId),
  explore: () => api.get("/exam/explore"),
  getChannel: (channelId: string) => api.get("/exam/channel/" + channelId),
  startExam: (examId: string) => api.get("/exam/start/" + examId),
  submitResponse: (examId: string, data: any) => api.post("/response/submit/" + examId, data)
}

export const Response = {
  submit: (examId: string, data: any) => api.post("/response/submit/" + examId, data),
  terminated: (examId: string, data: any) => api.post("/response/terminated/" + examId, data),
  getMyResponse: () => api.get("/response/my/detail"),
  getStudentResponse: (studentId: string) => api.get("/response/student/" + studentId),
  getExamResponse: (examId: string) => api.get("/response/exam/" + examId),
  getResponseById:(id:string)=>api.get("/response/"+id),
  addFacultyFeedback: (responseId: string, data: any) => api.put("/response/update/" + responseId, data)
}
export const Feedback={
  addFeedback:(examId:string,data:any)=>api.post("/feedback/create/"+examId,data),
  getFeedback:(examId:string)=>api.get("/feedback/exam/"+examId)
}
export default api;