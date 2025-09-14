import request from '../utils/request';

// 发送消息
export function sendMessage(data) {
  return request({
    url: '/chat/send',
    method: 'post',
    data
  });
}

// 获取聊天记录
export function getChatHistory(otherUserId) {
  return request({
    url: `/chat/history/${otherUserId}`,
    method: 'get'
  });
}

// 获取聊天用户列表
export function getChatUserList() {
  return request({
    url: '/chat/user/list',
    method: 'get'
  });
}

// 获取聊天用户列表（包含最后一条消息和未读消息数量）
export function getChatUserListWithDetail() {
  return request({
    url: '/chat/user/list/detail',
    method: 'get',
    // 添加错误处理
    catchError: true
  });
}

// 标记消息为已读
export function markMessageAsRead(fromUserId) {
  return request({
    url: `/chat/read/${fromUserId}`,
    method: 'post'
  });
}

// 删除联系人
export function deleteContact(contactUserId) {
  return request({
    url: `/chat/contact/${contactUserId}`,
    method: 'delete'
  });
}
