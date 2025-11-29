<template>
  <div class="app-container">
    <!-- 顶部栏 -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">校园失物招领系统</h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand" v-if="userInfo">
          <span class="el-dropdown-link">
            <el-avatar :size="32" :src="userInfo.avatarUrl || defaultAvatar"></el-avatar>
            <span class="username">{{ userInfo.realName }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    
    <div class="app-main">
      <!-- 左侧导航栏 -->
      <div class="app-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF">
          <el-menu-item index="/">
            <el-icon><house /></el-icon>
            <span>首页展示</span>
          </el-menu-item>
          <el-menu-item index="/user/dashboard">
            <el-icon><odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/user/item/list">
            <el-icon><document /></el-icon>
            <span>信息大厅</span>
          </el-menu-item>
          <el-menu-item index="/user/item/publish">
          <el-icon><Plus /></el-icon>
          <span>发布信息</span>
        </el-menu-item>
        <el-menu-item index="/user/item/my">
          <el-icon><Document /></el-icon>
          <span>我的发布</span>
        </el-menu-item>
          <el-menu-item index="/user/chat">
            <el-icon><chat-dot-round /></el-icon>
            <span>消息中心</span>
            <el-badge :value="unreadCount" :max="99" v-if="unreadCount > 0" class="message-badge" />
          </el-menu-item>
          <el-menu-item index="/user/profile">
            <el-icon><user /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 右侧内容区 -->
      <div class="app-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Odometer, Document, Plus, ChatDotRound, User, House } from '@element-plus/icons-vue';
import { getUserInfo, logout } from '../../api/user';
import { getUserDashboard } from '../../api/user';
import eventBus from '../../utils/eventBus';
import webSocketClient from '../../utils/websocket';

const router = useRouter();
const route = useRoute();
const userInfo = ref(null);
const unreadCount = ref(0);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo();
    userInfo.value = res.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const res = await getUserDashboard();
    unreadCount.value = res.data.unreadCount || 0;
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
  }
};

// 监听消息已读事件和新消息事件
const setupEventListeners = () => {
  eventBus.on('update-unread-count', fetchUnreadCount);
  eventBus.on('new-message', handleNewMessage);
  eventBus.on('unread-count-update', handleUnreadCountUpdate);
};

// 清除事件监听
const cleanupEventListeners = () => {
  eventBus.off('update-unread-count', fetchUnreadCount);
  eventBus.off('new-message', handleNewMessage);
  eventBus.off('unread-count-update', handleUnreadCountUpdate);
};

// 处理新消息
const handleNewMessage = (message) => {
  console.log('[Layout] 收到新消息:', message);
  
  // ✅ 直接更新未读数量
  if (message.unreadCount !== undefined) {
    unreadCount.value = message.unreadCount;
    console.log('[Layout] 立即更新未读数量:', message.unreadCount);
  }
  
  // ✅ 只有当前用户是接收方时才显示消息通知
  // 如果当前用户是发送方(fromUser)，则不显示提示
  if (userInfo.value && message.toUser === userInfo.value.id) {
    ElMessage({
      message: `收到来自 ${message.fromUserName || message.fromUsername || '用户'} 的新消息`,
      type: 'info',
      duration: 3000
    });
  }
};

// 处理未读消息数量更新（立即更新，无防抖）
const handleUnreadCountUpdate = (count) => {
  console.log('收到WebSocket未读消息数量更新:', count);
  // ✅ 直接更新，无延迟
  unreadCount.value = count;
  console.log('[Layout] 立即更新未读数量:', count);
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/user/profile');
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await logout(); // 调用后端退出登录接口
        // 清除token和用户信息
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        // 跳转到登录页
        router.push('/user/login');
        
        ElMessage.success('退出登录成功');
      } catch (error) {
        console.error('退出登录失败:', error);
        ElMessage.error('退出登录失败，请重试');
      }
    }).catch(() => {});
  }
};

// 初始化WebSocket连接
const initWebSocket = () => {
  if (userInfo.value && userInfo.value.id) {
    webSocketClient.connect(userInfo.value.id);
  }
};

onMounted(() => {
  fetchUserInfo().then(() => {
    // 获取用户信息后初始化WebSocket连接
    initWebSocket();
  });
  fetchUnreadCount();
  setupEventListeners();
  
  // 定时刷新未读消息数量（作为备用机制，仅在WebSocket未连接时使用）
  const timer = setInterval(() => {
    // 只有在WebSocket未连接时才进行轮询
    if (!webSocketClient.isConnected) {
      console.log('[Layout] WebSocket未连接，使用轮询更新未读数量');
      fetchUnreadCount();
    }
  }, 60000); // 每60秒检查一次
  
  // 组件卸载时清除定时器
  return () => {
    clearInterval(timer);
  };
});

onUnmounted(() => {
  cleanupEventListeners();
  // 关闭WebSocket连接
  webSocketClient.close();
});
</script>

<style scoped>
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar {
  width: 200px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu .el-menu-item {
  position: relative;
}

.app-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

.message-badge {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

/* 移除旧的未读角标上移样式，避免在不同分辨率错位 */
/* .unread-badge { margin-top: -2px; } */
</style>