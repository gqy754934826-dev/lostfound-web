<template>
  <div class="dashboard-container">
    <h2 class="dashboard-title">仪表盘</h2>
    
    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.totalCount || 0 }}</div>
            <div class="data-card-label">我的发布总数</div>
          </div>
          <el-icon class="data-card-icon"><document /></el-icon>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.pendingCount || 0 }}</div>
            <div class="data-card-label">待审核数量</div>
          </div>
          <el-icon class="data-card-icon"><timer /></el-icon>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.resolvedCount || 0 }}</div>
            <div class="data-card-label">已解决数量</div>
          </div>
          <el-icon class="data-card-icon"><check /></el-icon>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.unreadCount || 0 }}</div>
            <div class="data-card-label">未读消息</div>
          </div>
          <el-icon class="data-card-icon"><message /></el-icon>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷操作 -->
    <el-card class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <div class="quick-actions">
        <el-button type="primary" @click="goToPublish">发布失物信息</el-button>
        <el-button type="success" @click="goToPublish('claim')">发布招领信息</el-button>
        <el-button type="info" @click="goToItemList">查看信息大厅</el-button>
        <el-button type="warning" @click="goToChat">查看消息</el-button>
      </div>
    </el-card>
    
    <!-- 我的发布 -->
    <el-card class="my-items-card">
      <template #header>
        <div class="card-header">
          <span>我的发布</span>
          <el-button class="more-button" text @click="goToItemList">查看更多</el-button>
        </div>
      </template>
      <el-table :data="myItems" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" width="250" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'lost' ? 'danger' : 'success'">
              {{ scope.row.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="viewItemDetail(scope.row.id)">查看</el-button>
            <el-button 
              size="small" 
              type="success" 
              v-if="scope.row.status === 1" 
              @click="markAsResolved(scope.row.id)"
            >标记为已解决</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Timer, Check, Message } from '@element-plus/icons-vue';
import { getUserDashboard } from '../../api/user';
import { getUserItemList, updateItemStatus } from '../../api/item';
import eventBus from '../../utils/eventBus';

const router = useRouter();
const loading = ref(false);
const dashboardData = ref({});
const myItems = ref([]);

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    const res = await getUserDashboard();
    dashboardData.value = res.data;
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
  }
};

// 获取我的发布列表
const fetchMyItems = async () => {
  loading.value = true;
  try {
    const res = await getUserItemList({ pageNum: 1, pageSize: 5 });
    myItems.value = res.data.list;
  } catch (error) {
    console.error('获取我的发布列表失败:', error);
  } finally {
    loading.value = false;
  }
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

// 查看信息详情
const viewItemDetail = (id) => {
  router.push(`/user/item/detail/${id}`);
};

// 标记为已解决
const markAsResolved = (id) => {
  ElMessageBox.confirm('确定要将该信息标记为已解决吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateItemStatus(id, 3);
      ElMessage.success('操作成功');
      fetchMyItems();
      fetchDashboardData();
    } catch (error) {
      console.error('操作失败:', error);
    }
  }).catch(() => {});
};

// 跳转到发布页面
const goToPublish = (type) => {
  router.push({
    path: '/user/item/publish',
    query: { type }
  });
};

// 跳转到信息大厅
const goToItemList = () => {
  router.push('/user/item/list');
};

// 跳转到消息中心
const goToChat = () => {
  router.push('/user/chat');
};

// 监听事件
const setupEventListeners = () => {
  eventBus.on('new-message', handleNewMessage);
  eventBus.on('update-unread-count', fetchDashboardData);
  eventBus.on('unread-count-update', handleUnreadCountUpdate);
};

// 清除事件监听
const cleanupEventListeners = () => {
  eventBus.off('new-message', handleNewMessage);
  eventBus.off('update-unread-count', fetchDashboardData);
  eventBus.off('unread-count-update', handleUnreadCountUpdate);
};

// 处理新消息
const handleNewMessage = () => {
  // 收到新消息时更新仪表盘数据
  fetchDashboardData();
};

// 处理未读消息数量更新
const handleUnreadCountUpdate = (count) => {
  console.log('Dashboard收到未读消息数量更新:', count);
  dashboardData.value.unreadCount = count;
};

onMounted(() => {
  fetchDashboardData();
  fetchMyItems();
  setupEventListeners();
  
  // 定时刷新仪表盘数据（作为备用机制）
  const timer = setInterval(() => {
    fetchDashboardData();
  }, 10000); // 每10秒刷新一次
  
  // 组件卸载时清除定时器
  return () => {
    clearInterval(timer);
  };
});

onUnmounted(() => {
  cleanupEventListeners();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.data-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 20px;
}

.data-card-content {
  display: flex;
  flex-direction: column;
}

.data-card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.data-card-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.data-card-icon {
  font-size: 48px;
  color: #ebeef5;
}

.quick-actions-card,
.my-items-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.more-button {
  padding: 0;
  min-height: auto;
}
</style>