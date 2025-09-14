// 事件总线，用于组件间通信
import { ref } from 'vue';

class EventBus {
  constructor() {
    this.events = {};
  }

  // 注册事件监听
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // 移除事件监听
  off(event, callback) {
    if (!this.events[event]) return;
    if (!callback) {
      delete this.events[event];
      return;
    }
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // 触发事件
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export default new EventBus();