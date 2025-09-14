import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8080', // API的base_url
  timeout: 15000 // 请求超时时间
});

// request拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token');
    if (token) {
      // 设置请求头
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// response拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 如果返回的状态码不是200，说明接口请求失败
    if (res.code !== 200) {
      ElMessage.error(res.message || '系统异常');
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 清除token
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        // 跳转到登录页
        const currentPath = router.currentRoute.value.path;
        if (currentPath.startsWith('/admin')) {
          router.push('/admin/login');
        } else {
          router.push('/user/login');
        }
      }
      
      return Promise.reject(new Error(res.message || '系统异常'));
    } else {
      return res;
    }
  },
  error => {
    console.error('响应错误:', error);
    
    // 处理HTTP错误状态码
    const { response } = error;
    if (response) {
      const { status } = response;
      
      // 401: 未登录或token过期
      if (status === 401) {
        // 清除token
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        // 跳转到登录页
        const currentPath = router.currentRoute.value.path;
        if (currentPath.startsWith('/admin')) {
          router.push('/admin/login');
        } else {
          router.push('/user/login');
        }
        
        ElMessage.error('登录已过期，请重新登录');
      } else {
        ElMessage.error(error.message || '系统异常');
      }
    } else {
      ElMessage.error('网络异常，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default service;