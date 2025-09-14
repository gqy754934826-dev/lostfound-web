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
    
    // 处理catchError参数
    if (config.catchError) {
      config.hideErrorMessage = true;
      delete config.catchError; // 删除自定义参数，避免发送到服务器
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
    const config = response.config;
    
    // 如果返回的状态码不是200，说明接口请求失败
    if (res.code !== 200) {
      // 显示错误消息，除非请求配置中指定了不显示
      if (!config.hideErrorMessage) {
        ElMessage.error(res.message || '系统异常');
      }
      
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
      
      // 创建自定义错误对象，包含更多信息
      const error = new Error(res.message || '系统异常');
      error.code = res.code;
      error.data = res.data;
      return Promise.reject(error);
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