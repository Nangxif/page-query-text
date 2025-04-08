import { notification } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
const instance = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  proxy: {
    host: 'localhost',
    port: 3001,
  },
});

instance.interceptors.request.use((config) => {
  config.headers.Authorization = Cookies.get('PAGE_TOOLKIT_TOKEN');
  return config;
});
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error?.response?.status === 401) {
      window.location.href = '/Login.html';
    }
    notification.error({
      message: '请求失败',
      description: error?.message,
    });
    return Promise.reject(error);
  },
);

function request<T = any>(url: string, config?: AxiosRequestConfig) {
  return instance({
    url,
    ...config,
  }) as Promise<T>;
}

export default request;
