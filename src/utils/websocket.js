// WebSocket客户端，用于实时接收消息
import eventBus from './eventBus';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10; // 增加最大重连次数
    this.reconnectInterval = 1500; // 减少重连间隔至1.5秒
    this.heartbeatInterval = null;
    this.isConnected = false;
    this.userId = null;
  }

  // 连接WebSocket服务器
  connect(userId) {
    if (!userId) {
      console.error('WebSocket连接失败: 用户ID不能为空');
      return;
    }

    this.userId = userId;
    // 关闭之前的连接
    this.close();

    // 创建WebSocket连接
    // ✅ 修复：WebSocket应该连接到后端服务器(8080)，而不是前端开发服务器(5173)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // ✅ 直接使用后端服务器地址
    const wsUrl = `${protocol}//localhost:8080/ws/chat/${userId}`;
    
    console.log('🚀 [WebSocket] 准备连接...');
    console.log('  - 用户ID:', userId);
    console.log('  - Protocol:', protocol);
    console.log('  - 完整URL:', wsUrl);

    try {
      this.socket = new WebSocket(wsUrl);
      console.log('✅ [WebSocket] WebSocket对象已创建，等待onopen...');

      // 连接建立时的回调
      this.socket.onopen = () => {
        console.log('✅ [WebSocket] 连接已建立！');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      // 接收消息的回调
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] 收到消息:', data);
          
          // 处理不同类型的消息
          switch (data.type) {
            case 'CHAT':
              // ✅ 优先级最高：立即更新未读消息数量（使用WebSocket消息中携带的unreadCount）
              if (data.unreadCount !== undefined) {
                console.log('[WebSocket] [优先级最高] 立即更新未读消息数量:', data.unreadCount);
                eventBus.emit('unread-count-update', data.unreadCount);
              }
              
              // 然后触发新消息事件
              console.log('[WebSocket] 触发 new-message 事件');
              eventBus.emit('new-message', data);
              break;
            
            case 'READ_STATUS':
              // ✅ 优先更新未读数量
              if (data.unreadCount !== undefined) {
                console.log('[WebSocket] [优先级最高] 立即更新未读消息数量:', data.unreadCount);
                eventBus.emit('unread-count-update', data.unreadCount);
              }
              
              // 然后触发已读状态更新
              console.log('[WebSocket] 触发 read-status-update 事件');
              eventBus.emit('read-status-update', data);
              break;
            
            case 'UNREAD_COUNT':
              // 未读消息数量更新
              console.log('[WebSocket] [优先级最高] 触发 unread-count-update 事件, 数量:', data.unreadCount);
              eventBus.emit('unread-count-update', data.unreadCount);
              break;
            
            case 'HEARTBEAT':
              // 心跳响应，不做特殊处理
              break;
              
            default:
              console.log('[WebSocket] 收到未知类型的消息:', data);
              
              // 处理后端发送的事件类型消息
              if (data.event) {
                console.log('[WebSocket] 处理事件类型:', data.event);
                switch (data.event) {
                  case 'new-pending-item':
                    console.log('[WebSocket] 触发 new-pending-item 事件');
                    eventBus.emit('new-pending-item', data);
                    break;
                  case 'audit-notification':
                    console.log('[WebSocket] 触发 item-status-updated 事件');
                    eventBus.emit('item-status-updated', data);
                    break;
                  case 'item-updated':
                    console.log('[WebSocket] 触发 item-updated 事件');
                    eventBus.emit('item-updated', data);
                    break;
                  default:
                    // 对于未知事件，也触发事件总线
                    console.log('[WebSocket] 触发未知事件:', data.event);
                    eventBus.emit(data.event, data);
                }
              }
          }
          
          // 无论什么消息，都触发仪表盘数据更新事件
          console.log('[WebSocket] 触发 update-dashboard-data 事件');
          eventBus.emit('update-dashboard-data');
        } catch (error) {
          console.error('处理WebSocket消息失败:', error);
        }
      };

      // 连接关闭的回调
      this.socket.onclose = (event) => {
        console.log('❌ [WebSocket] 连接已关闭:', event);
        console.log('  - Code:', event.code);
        console.log('  - Reason:', event.reason);
        console.log('  - WasClean:', event.wasClean);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // 尝试重新连接
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`🔄 [WebSocket] 尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect(this.userId);
          }, this.reconnectInterval);
        } else {
          console.error('❌ [WebSocket] 已达到最大重连次数，停止重连');
        }
      };

      // 连接错误的回调
      this.socket.onerror = (error) => {
        console.error('❌ [WebSocket] 连接错误:', error);
        console.log('  - ReadyState:', this.socket.readyState);
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
    }
  }

  // 关闭WebSocket连接
  close() {
    if (this.socket) {
      this.stopHeartbeat();
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 发送消息
  send(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket未连接，无法发送消息');
    }
  }

  // 开始心跳检测
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        // 发送心跳消息
        this.send({ type: 'HEARTBEAT' });

        // 同时触发数据更新
        eventBus.emit('update-dashboard-data');
      }
    }, 15000); // 每15秒发送一次心跳
  }

  // 停止心跳检测
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export default new WebSocketClient();