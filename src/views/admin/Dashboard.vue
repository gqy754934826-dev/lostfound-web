<template>
  <div class="dashboard-container">
    <h2 class="dashboard-title">管理员仪表盘</h2>
    
    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.totalUserCount || 0 }}</div>
            <div class="data-card-label">总用户数</div>
          </div>
          <el-icon class="data-card-icon"><user /></el-icon>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.bannedUserCount || 0 }}</div>
            <div class="data-card-label">封禁用户数</div>
          </div>
          <el-icon class="data-card-icon"><circle-close /></el-icon>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.pendingItemCount || 0 }}</div>
            <div class="data-card-label">待审核信息数</div>
          </div>
          <el-icon class="data-card-icon"><timer /></el-icon>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-card-content">
            <div class="data-card-value">{{ dashboardData.todayNewItemCount || 0 }}</div>
            <div class="data-card-label">今日新增信息数</div>
          </div>
          <el-icon class="data-card-icon"><data-line /></el-icon>
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
        <el-button type="primary" @click="goToItemAudit">审核信息</el-button>
        <el-button type="warning" @click="goToUserManage">用户管理</el-button>
      </div>
    </el-card>
    
    <!-- 待审核信息 -->
    <el-card class="pending-items-card">
      <template #header>
        <div class="card-header">
          <span>待审核信息</span>
          <el-button class="more-button" text @click="goToItemAudit">查看更多</el-button>
        </div>
      </template>
      <el-table :data="pendingItems" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" width="250" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'lost' ? 'danger' : 'success'">
              {{ scope.row.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="viewItemDetail(scope.row.id)">查看</el-button>
            <el-button size="small" type="success" @click="approveItem(scope.row.id)">通过</el-button>
            <el-button size="small" type="danger" @click="rejectItem(scope.row.id)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, CircleClose, Timer, DataLine } from '@element-plus/icons-vue';
import { getAdminDashboard } from '../../api/admin';
import { getPendingItemList, updateItemStatus } from '../../api/item';

const router = useRouter();
const loading = ref(false);
const dashboardData = ref({});
const pendingItems = ref([]);

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    const res = await getAdminDashboard();
    dashboardData.value = res.data;
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
  }
};

// 获取待审核信息列表
const fetchPendingItems = async () => {
  loading.value = true;
  try {
    const res = await getPendingItemList({ pageNum: 1, pageSize: 5 });
    pendingItems.value = res.data.list;
  } catch (error) {
    console.error('获取待审核信息列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 查看信息详情
const viewItemDetail = (id) => {
  router.push(`/admin/item/detail/${id}`);
};

// 通过信息
const approveItem = async (id) => {
  try {
    await updateItemStatus(id, 1);
    ElMessage.success('审核通过成功');
    fetchPendingItems();
    fetchDashboardData();
  } catch (error) {
    console.error('操作失败:', error);
  }
};

// 拒绝信息
const rejectItem = async (id) => {
  try {
    await updateItemStatus(id, 2);
    ElMessage.success('审核拒绝成功');
    fetchPendingItems();
    fetchDashboardData();
  } catch (error) {
    console.error('操作失败:', error);
  }
};

// 跳转到信息审核页面
const goToItemAudit = () => {
  router.push('/admin/item/audit');
};

// 跳转到用户管理页面
const goToUserManage = () => {
  router.push('/admin/user/manage');
};

onMounted(() => {
  fetchDashboardData();
  fetchPendingItems();
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
.pending-items-card {
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