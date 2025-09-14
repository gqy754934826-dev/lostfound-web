import request from '../utils/request';

// 管理员登录
export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  });
}

// 获取管理员信息
export function getAdminInfo() {
  return request({
    url: '/admin/info',
    method: 'get'
  });
}

// 获取用户列表
export function getUserList() {
  return request({
    url: '/admin/user/list',
    method: 'get'
  });
}

// 更新用户状态
export function updateUserStatus(userId, status) {
  return request({
    url: '/admin/user/status',
    method: 'put',
    params: {
      userId,
      status
    }
  });
}

// 获取管理员仪表盘数据
export function getAdminDashboard() {
  return request({
    url: '/item/admin/dashboard',
    method: 'get'
  });
}