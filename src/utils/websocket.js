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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat/${userId}`;

    try {
      this.socket = new WebSocket(wsUrl);

      // 连接建立时的回调
      this.socket.onopen = () => {
        console.log('WebSocket连接已建立');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      // 接收消息的回调
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('收到WebSocket消息:', data);
          
          // 处理不同类型的消息
          switch (data.type) {
            case 'CHAT':
              // 触发新消息事件
              eventBus.emit('new-message', data);
              // 更新未读消息数量
              eventBus.emit('update-unread-count');
              break;
            
            case 'READ_STATUS':
              // 消息已读状态更新
              eventBus.emit('read-status-update', data);
              break;
            
            case 'UNREAD_COUNT':
              // 未读消息数量更新
              eventBus.emit('unread-count-update', data.unreadCount);
              break;
            
            case 'HEARTBEAT':
              // 心跳响应，不做特殊处理
              break;
              
            default:
              console.log('收到未知类型的WebSocket消息:', data);
          }
        } catch (error) {
          console.error('处理WebSocket消息失败:', error);
        }
      };

      // 连接关闭的回调
      this.socket.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // 尝试重新连接
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect(this.userId);
          }, this.reconnectInterval);
        }
      };

      // 连接错误的回调
      this.socket.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
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
        this.send({ type: 'HEARTBEAT' });
      }
    }, 15000); // 15秒发送一次心跳
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