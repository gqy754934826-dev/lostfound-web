// 管理员WebSocket客户端，用于实时接收管理员相关的通知
import eventBus from './eventBus';

class AdminWebSocketClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 1500;
    this.heartbeatInterval = null;
    this.isConnected = false;
    this.adminId = null;
  }

  // 连接管理员WebSocket服务器
  connect(adminId) {
    if (!adminId) {
      console.error('管理员WebSocket连接失败: 管理员ID不能为空');
      return;
    }

    this.adminId = adminId;
    // 关闭之前的连接
    this.close();

    // 创建WebSocket连接
    // ✅ 修复：WebSocket应该连接到后端服务器(8080)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:8080/ws/admin/${adminId}`;

    try {
      this.socket = new WebSocket(wsUrl);

      // 连接建立时的回调
      this.socket.onopen = () => {
        console.log('[AdminWebSocket] 连接已建立');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      // 接收消息的回调
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[AdminWebSocket] 收到消息:', data);
          
          // 处理不同类型的消息
          switch (data.event) {
            case 'new-pending-item':
              console.log('[AdminWebSocket] 触发 new-pending-item 事件');
              eventBus.emit('new-pending-item', data);
              eventBus.emit('admin-pending-changed');
              break;
            
            case 'audit-notification':
              console.log('[AdminWebSocket] 触发 audit-notification 事件');
              eventBus.emit('audit-notification', data);
              eventBus.emit('admin-pending-changed');
              break;
            
            case 'item-updated':
              console.log('[AdminWebSocket] 触发 item-updated 事件');
              eventBus.emit('item-updated', data);
              eventBus.emit('admin-pending-changed');
              break;
            
            case 'HEARTBEAT':
              // 心跳响应，不做特殊处理
              break;
              
            default:
              console.log('[AdminWebSocket] 收到未知类型的消息:', data);
              // 对于未知事件，也触发事件总线
              if (data.event) {
                eventBus.emit(data.event, data);
              }
          }
          
          // 触发通用的管理员数据更新事件
          eventBus.emit('admin-data-updated', data);
        } catch (error) {
          console.error('处理管理员WebSocket消息失败:', error);
        }
      };

      // 连接关闭的回调
      this.socket.onclose = (event) => {
        console.log('[AdminWebSocket] 连接已关闭:', event);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // 尝试重新连接（非正常关闭的情况下）
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`[AdminWebSocket] 尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect(this.adminId);
          }, this.reconnectInterval);
        }
      };

      // 连接错误的回调
      this.socket.onerror = (error) => {
        console.error('[AdminWebSocket] 连接错误:', error);
      };
    } catch (error) {
      console.error('创建管理员WebSocket连接失败:', error);
    }
  }

  // 关闭WebSocket连接
  close() {
    if (this.socket) {
      this.stopHeartbeat();
      this.socket.close(1000); // 正常关闭
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 发送消息
  send(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('[AdminWebSocket] 未连接，无法发送消息');
    }
  }

  // 开始心跳检测
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        // 发送心跳消息
        this.send({ type: 'HEARTBEAT' });
      }
    }, 30000); // 每30秒发送一次心跳
  }

  // 停止心跳检测
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 检查连接状态
  isConnectionOpen() {
    return this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export default new AdminWebSocketClient();