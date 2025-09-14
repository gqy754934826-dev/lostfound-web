<template>
  <div class="item-detail-container">
    <el-card class="item-detail-card">
      <template #header>
        <div class="card-header">
          <h2 class="item-title">{{ item.title }}</h2>
          <el-tag :type="item.type === 'lost' ? 'danger' : 'success'" size="large">
            {{ item.type === 'lost' ? '失物信息' : '招领信息' }}
          </el-tag>
        </div>
      </template>
      
      <div class="item-info">
        <div class="item-image" v-if="item.imageUrl">
          <el-image :src="item.imageUrl" :preview-src-list="[item.imageUrl]" fit="cover" />
        </div>
        
        <div class="item-details">
          <div class="detail-item">
            <span class="detail-label">发布时间：</span>
            <span>{{ item.createTime }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">地点：</span>
            <span>{{ item.location }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">时间：</span>
            <span>{{ formatDateTime(item.itemTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态：</span>
            <el-tag :type="getStatusType(item.status)">
              {{ getStatusText(item.status) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">描述：</span>
            <p class="item-description">{{ item.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="item-actions">
        <el-button @click="goBack">返回</el-button>
        
        <!-- 用户操作 -->
        <template v-if="isUser && !isAdmin">
          <!-- 如果是自己发布的信息 -->
          <template v-if="item.userId === userId">
            <el-button 
              type="success" 
              v-if="item.status === 1" 
              @click="markAsResolved"
            >标记为已解决</el-button>
          </template>
          <!-- 如果不是自己发布的信息 -->
          <template v-else>
            <el-button 
              type="primary" 
              v-if="item.status === 1" 
              @click="contactPublisher"
            >联系发布者</el-button>
          </template>
        </template>
        
        <!-- 管理员操作 -->
        <template v-if="isAdmin">
          <template v-if="item.status === 0">
            <el-button type="success" @click="approveItem">通过</el-button>
            <el-button type="danger" @click="rejectItem">拒绝</el-button>
          </template>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getItemDetail, updateItemStatus } from '../../api/item';

const route = useRoute();
const router = useRouter();
const item = ref({});
const loading = ref(false);

// 获取当前用户ID和角色
const userId = computed(() => {
  const id = localStorage.getItem('userId');
  return id ? parseInt(id) : null;
});

const isUser = computed(() => localStorage.getItem('role') === 'user');
const isAdmin = computed(() => localStorage.getItem('role') === 'admin');

// 获取信息详情
const fetchItemDetail = async () => {
  loading.value = true;
  try {
    const itemId = route.params.id;
    const res = await getItemDetail(itemId);
    item.value = res.data;
  } catch (error) {
    console.error('获取信息详情失败:', error);
    ElMessage.error('获取信息详情失败');
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleString();
};

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info';    // 待审核
    case 1: return 'success'; // 已通过
    case 2: return 'danger';  // 已拒绝
    case 3: return 'warning'; // 已解决
    default: return 'info';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    case 3: return '已解决';
    default: return '未知';
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 标记为已解决
const markAsResolved = async () => {
  try {
    await updateItemStatus(item.value.id, 3);
    ElMessage.success('操作成功');
    fetchItemDetail();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 联系发布者
const contactPublisher = () => {
  router.push(`/user/chat?userId=${item.value.userId}`);
};

// 通过信息（管理员）
const approveItem = async () => {
  try {
    await updateItemStatus(item.value.id, 1);
    ElMessage.success('审核通过成功');
    fetchItemDetail();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 拒绝信息（管理员）
const rejectItem = async () => {
  try {
    await updateItemStatus(item.value.id, 2);
    ElMessage.success('审核拒绝成功');
    fetchItemDetail();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

onMounted(() => {
  fetchItemDetail();
});
</script>

<style scoped>
.item-detail-container {
  padding: 20px;
}

.item-detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.item-info {
  display: flex;
  margin-bottom: 20px;
}

.item-image {
  width: 300px;
  margin-right: 20px;
}

.item-details {
  flex: 1;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-label {
  font-weight: bold;
  color: #606266;
}

.item-description {
  margin: 10px 0;
  white-space: pre-wrap;
  color: #606266;
}

.item-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
</style>