import axios from 'axios';
import { supabase } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
 baseURL: API_BASE,
});

// Add a request interceptor to inject the token natively from Supabase
api.interceptors.request.use(
 async (config) => {
 const { data: { session }, error } = await supabase.auth.getSession();
 
 // Silently handle getSession errors (often happens on initial load when unauthenticated)
 // if (error) console.error("Supabase getSession Error:", error);
 
 if (session?.access_token) {
 config.headers['Authorization'] = `Bearer ${session.access_token}`;
 }
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
 failedQueue.forEach(prom => {
 if (error) {
 prom.reject(error);
 } else {
 prom.resolve(token);
 }
 });
 failedQueue = [];
};

// Add a response interceptor to handle 401s and refresh tokens
api.interceptors.response.use(
 (response) => response,
 async (error) => {
 const originalRequest = error.config;

 if (error.response?.status === 401 && !originalRequest._retry) {
 if (isRefreshing) {
 return new Promise(function(resolve, reject) {
 failedQueue.push({ resolve, reject });
 }).then(token => {
 originalRequest.headers['Authorization'] = 'Bearer ' + token;
 return api(originalRequest);
 }).catch(err => {
 return Promise.reject(err);
 });
 }

 originalRequest._retry = true;
 isRefreshing = true;

 try {
 const { data, error: refreshError } = await supabase.auth.refreshSession();
 
 if (refreshError || !data.session) {
 processQueue(refreshError || new Error("Session expired"), null);
 return Promise.reject(error);
 }

 const newToken = data.session.access_token;
 processQueue(null, newToken);
 
 originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
 return api(originalRequest);
 } catch (err) {
 processQueue(err, null);
 return Promise.reject(error);
 } finally {
 isRefreshing = false;
 }
 }

 return Promise.reject(error);
 }
);

export default api;
