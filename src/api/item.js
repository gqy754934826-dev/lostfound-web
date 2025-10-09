import request from '../utils/request';

// 发布信息
export function publishItem(data) {
  return request({
    url: '/item/publish',
    method: 'post',
    data
  });
}

// 上传物品图片
export function uploadItemImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/item/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 获取信息列表
export function getItemList(params) {
  return request({
    url: '/item/list',
    method: 'get',
    params
  });
}

// 获取信息详情
export function getItemDetail(itemId) {
  return request({
    url: `/item/detail/${itemId}`,
    method: 'get'
  });
}

// 获取用户发布的信息列表
export function getUserItemList(params) {
  return request({
    url: '/item/user/list',
    method: 'get',
    params
  });
}

// 更新信息状态
export function updateItemStatus(itemId, status) {
  return request({
    url: '/item/status',
    method: 'put',
    params: {
      itemId,
      status
    }
  });
}

// 获取待审核的信息列表（管理员）
export function getPendingItemList(params) {
  return request({
    url: '/item/admin/pending',
    method: 'get',
    params
  });
}

// 删除信息
export function deleteItemById(itemId) {
  return request({
    url: `/item/delete/${itemId}`,
    method: 'delete'
  });
}

// 更新信息
export function updateItem(data) {
  return request({
    url: '/item/update',
    method: 'put',
    data
  })
}

// 标记信息为已完成
export function completeItem(itemId) {
  return request({
    url: `/item/complete/${itemId}`,
    method: 'put'
  });
}

// 获取用户信息类型统计
export function getUserItemTypeStats() {
  return request({
    url: '/item/user/stats/type',
    method: 'get'
  });
}

// 获取用户信息每日统计
export function getUserItemDailyStats() {
  return request({
    url: '/item/user/stats/daily',
    method: 'get'
  });
}

// 获取用户信息状态统计
export function getUserItemStatusStats() {
  return request({
    url: '/item/user/stats/status',
    method: 'get'
  });
}

// 获取各类型信息统计数据
export function getItemTypeStats() {
  return request({
    url: '/item/stats/type',
    method: 'get'
  });
}

// 获取各状态信息统计数据
export function getItemStatusStats() {
  return request({
    url: '/item/stats/status',
    method: 'get'
  });
}

// 获取最近7天每天的信息发布数量
export function getItemDailyStats() {
  return request({
    url: '/item/stats/daily',
    method: 'get'
  });
}

// 用户统计数据已在上面定义