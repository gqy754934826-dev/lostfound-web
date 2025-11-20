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
    
    <!-- 统计图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>信息类型分布</span>
            </div>
          </template>
          <div ref="typeChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>信息状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>最近7天发布趋势</span>
            </div>
          </template>
          <div ref="dailyChartRef" class="chart"></div>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, CircleClose, Timer, DataLine } from '@element-plus/icons-vue';
import { getAdminDashboard, getChartData, getItemTypeStats, getItemStatusStats, getItemDailyStats } from '../../api/admin';
import { getPendingItemList, updateItemStatus } from '../../api/item';
import * as echarts from 'echarts/core';
import { PieChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import eventBus from '../../utils/eventBus';
import webSocketClient from '../../utils/websocket';

// 注册必须的组件
echarts.use([
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
]);

const router = useRouter();
const loading = ref(false);
const dashboardData = ref({});
const pendingItems = ref([]);
const chartData = ref({});
let socket; // WebSocket 连接实例

// 图表引用
const typeChartRef = ref(null);
const statusChartRef = ref(null);
const dailyChartRef = ref(null);

// 获取仪表盘数据
const fetchDashboardData = async () => {
  console.log('[Dashboard] 开始获取仪表盘数据');
  try {
    loading.value = true;
    const res = await getAdminDashboard();
    console.log('[Dashboard] 获取仪表盘数据成功:', res.data);
    dashboardData.value = res.data;
    
    // 触发事件总线通知其他组件
    eventBus.emit('dashboard-data-updated', res.data);
  } catch (error) {
    console.error('[Dashboard] 获取仪表盘数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// WebSocket 消息处理
const handleWebSocketMessage = (event) => {
  const data = JSON.parse(event.data);

  // 根据事件类型处理消息
  switch (data.event) {
    case 'new-pending-item':
      fetchDashboardData();
      ElMessage.info('有新的待审核信息');
      break;
    case 'audit-notification':
      fetchDashboardData();
      ElMessage.info('信息状态已更新');
      break;
    case 'item-updated':
      fetchDashboardData();
      ElMessage.info('信息已被修改');
      break;
    default:
      console.warn('未知的 WebSocket 消息事件:', data.event);
  }
};

onMounted(() => {
  console.log('[Dashboard Admin] 组件挂载');
  fetchDashboardData();
  fetchPendingItems();
  fetchChartData();

  // 使用 WebSocketClient 而不是直接创建 WebSocket 连接
  // 监听心跳事件触发数据更新
  console.log('[Dashboard Admin] 注册 update-dashboard-data 事件监听');
  eventBus.on('update-dashboard-data', () => {
    console.log('[Dashboard Admin] 收到 update-dashboard-data 事件，刷新数据');
    fetchDashboardData();
    fetchPendingItems();
  });
  
  // 监听新待审核信息事件
  eventBus.on('new-pending-item', (data) => {
    console.log('[Dashboard Admin] 收到 new-pending-item 事件，刷新数据');
    fetchDashboardData();
    fetchPendingItems();
    ElMessage.info('有新的待审核信息');
  });
  
  // 监听信息状态更新事件
  eventBus.on('item-status-updated', (data) => {
    console.log('[Dashboard Admin] 收到 item-status-updated 事件，刷新数据');
    fetchDashboardData();
    fetchPendingItems();
    ElMessage.info('信息状态已更新');
  });
  
  // 监听信息修改事件
  eventBus.on('item-updated', (data) => {
    console.log('[Dashboard Admin] 收到 item-updated 事件，刷新数据');
    fetchDashboardData();
    fetchPendingItems();
    ElMessage.info('信息已被修改');
  });
  
  // 监听管理员待审核变更事件
  eventBus.on('admin-pending-changed', () => {
    console.log('[Dashboard Admin] 收到 admin-pending-changed 事件，刷新数据');
    fetchDashboardData();
    fetchPendingItems();
  });
});

onUnmounted(() => {
  // 移除事件监听
  eventBus.off('update-dashboard-data', fetchDashboardData);
  eventBus.off('new-pending-item');
  eventBus.off('item-status-updated');
  eventBus.off('item-updated');
  eventBus.off('admin-pending-changed');
});

// 获取图表数据
const fetchChartData = async () => {
  try {
    // 获取类型统计数据
    const typeRes = await getItemTypeStats();
    // 处理类型统计数据，确保格式正确
    let processedTypeData = [];
    if (typeRes.data && Array.isArray(typeRes.data)) {
      processedTypeData = typeRes.data;
    } else {
      // 提供默认数据
      processedTypeData = [
        { name: '失物', value: 0 },
        { name: '招领', value: 0 }
      ];
    }
    
    // 获取状态统计数据
    const statusRes = await getItemStatusStats();
    // 处理状态统计数据，确保格式正确
    let processedStatusData = [];
    if (statusRes.data && Array.isArray(statusRes.data)) {
      processedStatusData = statusRes.data;
    } else {
      // 提供默认数据
      processedStatusData = [
        { name: '待审核', value: 0 },
        { name: '已通过', value: 0 },
        { name: '已拒绝', value: 0 },
        { name: '已解决', value: 0 }
      ];
    }
    
    // 获取每日统计数据
    const dailyRes = await getItemDailyStats();
    
    // 处理每日统计数据，转换为前端需要的格式
    const dates = [];
    const counts = [];
    
    if (dailyRes.data && Array.isArray(dailyRes.data) && dailyRes.data.length > 0) {
      dailyRes.data.forEach(item => {
        if (item && item.day && typeof item.count === 'number') {
          // 格式化日期显示，将YYYY-MM-DD转换为MM-DD格式
          const dateStr = item.day.toString();
          const formattedDate = dateStr.includes('-') ? dateStr.substring(5) : dateStr;
          dates.push(formattedDate);
          counts.push(item.count);
        }
      });
    }
    
    // 如果没有数据，生成最近7天的默认日期
    let defaultDates = [];
    let defaultCounts = [];
    if (dates.length === 0) {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        defaultDates.push(`${month}-${day}`);
        defaultCounts.push(0);
      }
    }
    
    chartData.value = {
      typeData: processedTypeData,
      statusData: processedStatusData,
      dailyData: {
        dates: dates.length > 0 ? dates : defaultDates,
        counts: counts.length > 0 ? counts : defaultCounts
      }
    };
    

    
    // 确保数据加载完成后再初始化图表
    nextTick(() => {

      initCharts();
    });
  } catch (error) {
    console.error('获取图表数据失败:', error);
  }
};

// 初始化图表
const initCharts = () => {
  // 信息类型分布图表
  if (typeChartRef.value) {
    const typeChart = echarts.init(typeChartRef.value);
    typeChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        data: ['失物', '招领']
      },
      series: [
        {
          name: '信息类型',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '55%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: chartData.value.typeData || [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
  }

  // 信息状态分布图表
  if (statusChartRef.value) {
    const statusChart = echarts.init(statusChartRef.value);
    statusChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        data: ['已完成', '待审核', '已拒绝','已通过']
      },
      series: [
        {
          name: '信息状态',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '55%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: chartData.value.statusData || [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
  }

  // 最近7天发布趋势图表
  if (dailyChartRef.value) {
    const dailyChart = echarts.init(dailyChartRef.value);
    dailyChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['发布数量']
      },
      grid: {
        left: '6%',
        right: '6%',
        bottom: '16%',
        top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.value.dailyData?.dates || []
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '发布数量',
          type: 'line',
          stack: '总量',
          data: chartData.value.dailyData?.counts || []
        }
      ]
    });
  }
};

// 获取待审核信息列表
const fetchPendingItems = async () => {
  console.log('[Dashboard] 开始获取待审核信息列表');
  loading.value = true;
  try {
    const res = await getPendingItemList({ pageNum: 1, pageSize: 5, _t: Date.now() });
    pendingItems.value = res.data.list;
    console.log('[Dashboard] 获取待审核信息列表成功:', res.data.list.length);
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
    fetchChartData();
    eventBus.emit('admin-pending-changed'); // 触发事件更新小红点
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
    fetchChartData();
    eventBus.emit('admin-pending-changed'); // 触发事件更新小红点
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
  fetchChartData();

  // 监听新信息发布事件
  eventBus.on('new-item-published', handleNewItemPublished);

  // 确保图表初始化
  nextTick(() => {
    initCharts();
  });
});

// 处理新信息发布事件
const handleNewItemPublished = () => {
  ElMessage.info('有新的信息发布，正在更新数据...');
  fetchDashboardData();
  fetchPendingItems();
  fetchChartData();
};
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

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 300px;
  width: 100%;
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