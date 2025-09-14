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

// 标记消息为已读
export function markMessageAsRead(fromUserId) {
  return request({
    url: `/chat/read/${fromUserId}`,
    method: 'post'
  });
}
