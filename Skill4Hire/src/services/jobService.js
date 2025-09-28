import axios from "axios";

const API_URL = "http://localhost:8080/api/jobposts"; // adjust to your backend

export const jobService = {
  getAll: () => axios.get(API_URL).then((res) => res.data),
  getById: (id) => axios.get(`${API_URL}/${id}`).then((res) => res.data),
  create: (job) => axios.post(API_URL, job).then((res) => res.data),
  update: (id, job) => axios.put(`${API_URL}/${id}`, job).then((res) => res.data),
  remove: (id) => axios.delete(`${API_URL}/${id}`).then((res) => res.data),
};
