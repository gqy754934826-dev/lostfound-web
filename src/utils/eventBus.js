// 事件总线，用于组件间通信

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
    console.log(`[EventBus] 注册事件: ${event}, 当前监听器数量: ${this.events[event].length}`);
  }

  // 移除事件监听
  off(event, callback) {
    if (!this.events[event]) return;
    if (!callback) {
      delete this.events[event];
      console.log(`[EventBus] 移除所有 ${event} 事件监听器`);
      return;
    }
    const initialLength = this.events[event].length;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    console.log(`[EventBus] 移除事件: ${event}, 移除前: ${initialLength}, 移除后: ${this.events[event].length}`);
  }

  // 触发事件
  emit(event, data) {
    if (!this.events[event]) {
      console.log(`[EventBus] 触发事件: ${event}, 但没有监听器`);
      return;
    }
    console.log(`[EventBus] 触发事件: ${event}, 监听器数量: ${this.events[event].length}`);
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] 事件 ${event} 处理错误:`, error);
      }
    });
  }
}

export default new EventBus();