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