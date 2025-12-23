import request from '../utils/request';

// 管理员登录
export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  });
}

// 获取验证码
export function getCaptcha() {
  return request({
    url: '/admin/captcha',
    method: 'get'
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

// 分页获取用户列表
export function getUserListPaging(pageNum, pageSize, username, realName, studentNo) {
  return request({
    url: '/admin/user/list/paging',
    method: 'get',
    params: {
      pageNum,
      pageSize,
      username,
      realName,
      studentNo
    }
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

// 获取图表数据
export function getChartData() {
  return request({
    url: '/item/stats/all',
    method: 'get'
  });
}

// 获取信息类型统计
export function getItemTypeStats() {
  return request({
    url: '/item/stats/type',
    method: 'get'
  });
}

// 获取信息状态统计
export function getItemStatusStats() {
  return request({
    url: '/item/stats/status',
    method: 'get'
  });
}

// 获取每日信息统计
export function getItemDailyStats() {
  return request({
    url: '/item/stats/daily',
    method: 'get'
  });
}

// 管理员退出登录
export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  });
}