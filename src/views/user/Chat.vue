<template>
  <div class="chat-container">
    <h2 class="page-title">消息中心</h2>
    
    <el-card class="chat-card">
      <div class="chat-layout">
        <!-- 联系人列表 -->
        <div class="contact-list">
          <div class="contact-header">
            <h3>联系人列表</h3>
          </div>
          <div class="contact-body">
            <div 
              v-for="user in chatUsers" 
              :key="user.userId" 
              class="contact-item"
              :class="{ 'active': currentChatUser && currentChatUser.userId === user.userId }"
              @click="selectChatUser(user)"
            >
              <el-avatar :size="40" :src="user.avatarUrl || defaultAvatar"></el-avatar>
              <div class="contact-info">
                <div class="contact-name">{{ user.realName }}</div>
                <div class="contact-username">{{ user.username }}</div>
              </div>
            </div>
            <div v-if="chatUsers.length === 0" class="no-contact">
              暂无聊天记录
            </div>
          </div>
        </div>
        
        <!-- 聊天区域 -->
        <div class="chat-area">
          <template v-if="currentChatUser">
            <div class="chat-header">
              <h3>{{ currentChatUser.realName }}</h3>
            </div>
            <div class="chat-messages" ref="chatMessagesRef">
              <div v-if="chatMessages.length === 0" class="no-message">
                暂无消息记录，开始聊天吧
              </div>
              <div 
                v-for="(message, index) in chatMessages" 
                :key="index" 
                class="message-item"
                :class="{ 'self': message.fromUser === userId }"
              >
                <el-avatar 
                  :size="36" 
                  :src="message.fromUser === userId ? (userInfo.avatarUrl || defaultAvatar) : (currentChatUser.avatarUrl || defaultAvatar)"
                ></el-avatar>
                <div class="message-content">
                  <div class="message-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.createTime) }}</div>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="messageContent"
                type="textarea"
                :rows="3"
                placeholder="请输入消息内容"
                @keyup.enter.native="sendMessage"
              />
              <el-button type="primary" :loading="sending" @click="sendMessage">发送</el-button>
            </div>
          </template>
          <div v-else class="no-chat-selected">
            <el-empty description="请选择联系人开始聊天" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getChatUserList, getChatHistory, sendMessage as apiSendMessage, markMessageAsRead } from '../../api/chat';
import { getUserInfo } from '../../api/user';

const route = useRoute();
const chatUsers = ref([]);
const chatMessages = ref([]);
const currentChatUser = ref(null);
const messageContent = ref('');
const sending = ref(false);
const chatMessagesRef = ref(null);
const userId = ref(null);
const userInfo = ref({});
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 获取聊天用户列表
const fetchChatUsers = async () => {
  try {
    const res = await getChatUserList();
    chatUsers.value = res.data;
    
    // 如果URL中有userId参数，选择对应的用户
    const urlUserId = route.query.userId;
    if (urlUserId) {
      const targetUser = chatUsers.value.find(user => user.userId === parseInt(urlUserId));
      if (targetUser) {
        selectChatUser(targetUser);
      }
    }
  } catch (error) {
    console.error('获取聊天用户列表失败:', error);
    ElMessage.error('获取聊天用户列表失败，请稍后再试');
    chatUsers.value = []; // 确保在错误情况下设置为空数组
  }
};

// 获取当前用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo();
    userInfo.value = res.data;
    userId.value = res.data.id;
    
    // 获取聊天用户列表
    await fetchChatUsers();
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 选择聊天用户
const selectChatUser = async (user) => {
  currentChatUser.value = user;
  await fetchChatHistory();
  
  // 标记该用户发送的消息为已读
  try {
    await markMessageAsRead(user.userId);
  } catch (error) {
    console.error('标记消息为已读失败:', error);
  }
};

// 获取聊天记录
const fetchChatHistory = async () => {
  if (!currentChatUser.value || !userId.value) return;
  
  try {
    const res = await getChatHistory(currentChatUser.value.userId);
    chatMessages.value = res.data;
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
    // 标记该用户发送的消息为已读
    await markMessageAsRead(currentChatUser.value.userId);
  } catch (error) {
    console.error('获取聊天记录失败:', error);
  }
};

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim() || !currentChatUser.value) return;
  
  sending.value = true;
  try {
    await apiSendMessage({
      toUser: currentChatUser.value.userId,
      content: messageContent.value.trim()
    });
    
    // 清空输入框
    messageContent.value = '';
    
    // 重新获取聊天记录
    await fetchChatHistory();
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  } finally {
    sending.value = false;
  }
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString();
};

// 滚动到底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动到底部
watch(chatMessages, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

onMounted(() => {
  fetchUserInfo();
  
  // 定时刷新聊天记录
  const timer = setInterval(() => {
    if (currentChatUser.value) {
      fetchChatHistory();
    }
  }, 10000); // 每10秒刷新一次
  
  // 组件卸载时清除定时器
  return () => {
    clearInterval(timer);
  };
});
</script>

<style scoped>
.chat-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.chat-card {
  margin-bottom: 20px;
}

.chat-layout {
  display: flex;
  height: 600px;
}

.contact-list {
  width: 250px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.contact-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.contact-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.contact-body {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.contact-item:hover {
  background-color: #f5f7fa;
}

.contact-item.active {
  background-color: #ecf5ff;
}

.contact-info {
  margin-left: 10px;
}

.contact-name {
  font-size: 14px;
  color: #303133;
}

.contact-username {
  font-size: 12px;
  color: #909399;
}

.no-contact {
  padding: 20px;
  text-align: center;
  color: #909399;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.chat-messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.no-message {
  padding: 20px;
  text-align: center;
  color: #909399;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
  margin: 0 10px;
}

.message-text {
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  word-break: break-all;
}

.message-item.self .message-text {
  background-color: #ecf5ff;
  color: #409EFF;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.message-item.self .message-time {
  text-align: left;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: flex-end;
}

.chat-input .el-input {
  margin-right: 10px;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>