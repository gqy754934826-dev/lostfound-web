/**
 * 日期时间工具函数
 */

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间字符串或Date对象
 * @returns {string} - 格式化后的日期时间字符串
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  // 处理字符串格式的日期时间
  if (typeof dateTime === 'string') {
    // 后端已经格式化为yyyy-MM-dd HH:mm:ss，直接返回
    if (!dateTime.includes('T') && !dateTime.includes('.')) {
      return dateTime;
    }
    
    // 替换ISO格式中的'T'为空格
    dateTime = dateTime.replace('T', ' ');
    // 移除可能的毫秒部分
    if (dateTime.includes('.')) {
      dateTime = dateTime.split('.')[0];
    }
    return dateTime;
  }
  
  // 如果是Date对象，格式化为yyyy-MM-dd HH:mm:ss
  if (dateTime instanceof Date) {
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  return '';
};