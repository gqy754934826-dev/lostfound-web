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
    
    <!-- 统计图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card class="chart-card">
          <div class="chart-header">我发布的信息类型分布</div>
          <div ref="typeChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <div class="chart-header">我发布的信息状态分布</div>
          <div ref="statusChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <div class="chart-header">最近7天所有人发布趋势</div>
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
        <el-table-column prop="createTime" label="发布时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Timer, Check, Message } from '@element-plus/icons-vue';
import { getUserDashboard } from '../../api/user';
import { getUserItemList, getUserItemTypeStats, getUserItemStatusStats, getUserItemDailyStats, getItemDailyStats, updateItemStatus } from '../../api/item';
import eventBus from '../../utils/eventBus';
import { formatDateTime } from '../../utils/dateUtils';
import * as echarts from 'echarts';
import { PieChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
// Register ECharts components and renderer
if (typeof echarts.use === 'function') {
  echarts.use([PieChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);
}
const router = useRouter();
const loading = ref(false);
const dashboardData = ref({});
const myItems = ref([]);
const typeChartRef = ref(null);
const statusChartRef = ref(null);
const dailyChartRef = ref(null);
let typeChart = null;
let statusChart = null;
let dailyChart = null;

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    const res = await getUserDashboard();
    dashboardData.value = res.data;
    return res.data;
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
  }
};

// 初始化图表
const initCharts = async () => {
  try {
    // 获取类型统计数据
    const typeRes = await getUserItemTypeStats();
    // 处理类型统计数据，确保格式正确
    let processedTypeData = [];
    
    // 先设置默认数据，确保图表始终能显示
    processedTypeData = [
      { name: '失物', value: 0 },
      { name: '招领', value: 0 }
    ];
    
    // 如果API返回了有效数据，则更新默认值
    if (typeRes && typeRes.data && Array.isArray(typeRes.data)) {
      // 查找失物和招领类型的数据
      const lostItem = typeRes.data.find(item => item.name === '失物');
      const claimItem = typeRes.data.find(item => item.name === '招领');
      
      // 更新数据值
      if (lostItem) {
        processedTypeData[0].value = lostItem.value;
      }
      
      if (claimItem) {
        processedTypeData[1].value = claimItem.value;
      }
    }
    
    // console.log('类型统计数据:', processedTypeData);
    
    // 获取状态统计数据
    const statusRes = await getUserItemStatusStats();
    // 处理状态统计数据，确保格式正确
    let processedStatusData = [
      { name: '已解决', value: 0 },
      { name: '待审核', value: 0 },
      { name: '已拒绝', value: 0 },
      { name: '已通过', value: 0 }
    ];
    
    // 如果API返回了有效数据，则更新默认值
    if (statusRes && statusRes.data && Array.isArray(statusRes.data)) {
      // 查找并更新各状态的数据
      const resolvedItem = statusRes.data.find(item => item.name === '已解决');
      const pendingItem = statusRes.data.find(item => item.name === '待审核');
      const rejectedItem = statusRes.data.find(item => item.name === '已拒绝');
      const approvedItem = statusRes.data.find(item => item.name === '已通过');
      
      // 更新数据值
      if (resolvedItem) {
        processedStatusData[0].value = resolvedItem.value;
      }
      
      if (pendingItem) {
        processedStatusData[1].value = pendingItem.value;
      }
      
      if (rejectedItem) {
        processedStatusData[2].value = rejectedItem.value;
      }
      
      if (approvedItem) {
        processedStatusData[3].value = approvedItem.value;
      }
    }
    
    // console.log('状态统计数据:', processedStatusData);
    
    // 获取每日统计数据（显示所有人的数据）
    const dailyRes = await getItemDailyStats();
    
    // 处理每日统计数据，转换为前端需要的格式
    // 先生成最近7天的默认日期和数据
    const defaultDates = [];
    const defaultCounts = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      defaultDates.push(`${month}-${day}`);
      defaultCounts.push(0);
    }
    
    // 创建日期和计数数组
    let dates = [...defaultDates];
    let counts = [...defaultCounts];
    
    // 如果API返回了有效数据，则更新对应日期的值
    if (dailyRes.data && Array.isArray(dailyRes.data) && dailyRes.data.length > 0) {
      dailyRes.data.forEach(item => {
        if (item && item.day && typeof item.count === 'number') {
          // 格式化日期显示，将YYYY-MM-DD转换为MM-DD格式
          const dateStr = item.day.toString();
          const formattedDate = dateStr.includes('-') ? dateStr.substring(5) : dateStr;
          
          // 查找该日期在默认数组中的索引
          const index = dates.findIndex(date => date === formattedDate);
          if (index !== -1) {
            // 更新对应日期的计数
            counts[index] = item.count;
          }
        }
      });
    }
    
    // 创建新的数据对象
    const processedDailyData = {
      dates: dates,
      counts: counts
    };
    
    // console.log('每日统计数据处理完成:', processedDailyData);
    
    // console.log('用户端每日统计数据:', processedDailyData);
    
    // 在图表初始化时使用处理后的数据
    
    nextTick(() => {
      // 初始化类型分布图表
      if (typeChartRef.value) {
        typeChart = echarts.init(typeChartRef.value);
        
        // 确保数据中至少有一个非零值，否则显示提示信息
        const hasData = processedTypeData.some(item => item.value > 0);
        
        if (hasData) {
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
                data: processedTypeData,
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
        } else {
          // 如果没有数据，显示无数据提示
          typeChart.setOption({
            title: {
              text: '暂无数据',
              left: 'center',
              top: 'center',
              textStyle: {
                color: '#999',
                fontSize: 16,
                fontWeight: 'normal'
              }
            },
            tooltip: {},
            series: []
          });
        }
      }
      
      // 初始化状态分布图表
      if (statusChartRef.value) {
        statusChart = echarts.init(statusChartRef.value);
        
        // 确保数据中至少有一个非零值，否则显示提示信息
        const hasData = processedStatusData.some(item => item.value > 0);
        
        if (hasData) {
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
              data: ['已解决', '待审核', '已拒绝', '已通过']
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
                data: processedStatusData,
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
        } else {
          // 如果没有数据，显示无数据提示
          statusChart.setOption({
            title: {
              text: '暂无数据',
              left: 'center',
              top: 'center',
              textStyle: {
                color: '#999',
                fontSize: 16,
                fontWeight: 'normal'
              }
            },
            tooltip: {},
            series: []
          });
        }
      }
      
      // 初始化每日趋势图表
      if (dailyChartRef.value) {
        dailyChart = echarts.init(dailyChartRef.value);
        
        // 确保数据中至少有一个非零值，否则显示提示信息
        const hasData = processedDailyData.counts && processedDailyData.counts.some(count => count > 0);
        
        if (hasData) {
          dailyChart.setOption({
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              type: 'scroll',
              bottom: 0,
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
              data: processedDailyData.dates || [],
              axisLabel: {
                hideOverlap: true,
                rotate: 30
              }
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                name: '发布数量',
                type: 'line',
                stack: '总量',
                data: processedDailyData.counts || [],
                itemStyle: {
                  color: '#409EFF'
                },
                lineStyle: {
                  width: 2
                },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: 'rgba(64,158,255,0.3)'
                    }, {
                      offset: 1, color: 'rgba(64,158,255,0.1)'
                    }]
                  }
                }
              }
            ]
          });
        } else {
          // 如果没有数据，显示无数据提示
          dailyChart.setOption({
            title: {
              text: '暂无数据',
              left: 'center',
              top: 'center',
              textStyle: {
                color: '#999',
                fontSize: 16,
                fontWeight: 'normal'
              }
            },
            tooltip: {},
            xAxis: {
              type: 'category',
              data: processedDailyData.dates || []
            },
            yAxis: {
              type: 'value'
            },
            series: []
          });
        }
      }
    });
  } catch (error) {
    console.error('初始化图表失败:', error);
  }
};

// 处理窗口大小变化，重绘图表
const handleResize = () => {
  if (typeChart) typeChart.resize();
  if (statusChart) statusChart.resize();
  if (dailyChart) dailyChart.resize();
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

onMounted(() => {
  fetchDashboardData();
  fetchMyItems();
  
  // 设置事件监听
  setupEventListeners();
  
  // 确保图表初始化
  nextTick(() => {
    initCharts();
  });
});

onUnmounted(() => {
  // 清除事件监听
  cleanupEventListeners();
});

// 监听事件
const setupEventListeners = () => {
  eventBus.on('new-message', handleNewMessage);
  eventBus.on('update-unread-count', fetchDashboardData);
  eventBus.on('unread-count-update', handleUnreadCountUpdate);
  eventBus.on('update-dashboard-data', fetchDashboardData);
  eventBus.on('item-updated', () => {
    fetchDashboardData();
    fetchMyItems();
    ElMessage.info('信息已被修改');
  });
  eventBus.on('item-status-updated', () => {
    fetchDashboardData();
    fetchMyItems();
    ElMessage.info('信息状态已更新');
  });
};

// 清除事件监听
const cleanupEventListeners = () => {
  eventBus.off('new-message', handleNewMessage);
  eventBus.off('update-unread-count', fetchDashboardData);
  eventBus.off('unread-count-update', handleUnreadCountUpdate);
  eventBus.off('update-dashboard-data', fetchDashboardData);
  eventBus.off('item-updated');
  eventBus.off('item-status-updated');
};

// 处理新消息
const handleNewMessage = () => {
  // 收到新消息时更新仪表盘数据
  fetchDashboardData();
  ElMessage.info('您有新的消息');
};

// 处理未读消息数量更新（立即更新，无防抖）
const handleUnreadCountUpdate = (count) => {
  console.log('Dashboard收到未读消息数量更新:', count);
  // ✅ 直接更新，无延迟
  if (dashboardData.value) {
    dashboardData.value.unreadCount = count;
    console.log('[Dashboard] 立即更新未读数量:', count);
  }
};

// 初始化图表（管理员视图）
const initAdminCharts = () => {
  nextTick(() => {
    // 类型分布图表
    if (typeChartRef.value) {
      typeChart = echarts.init(typeChartRef.value);
      const typeOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          bottom: 0,
          left: 'center',
          data: ['失物', '招领', '已解决', '待审核']
        },
        series: [
          {
            name: '发布类型',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: dashboardData.value.lostCount || 0, name: '失物' },
              { value: dashboardData.value.claimCount || 0, name: '招领' },
              { value: dashboardData.value.resolvedCount || 0, name: '已解决' },
              { value: dashboardData.value.pendingCount || 0, name: '待审核' }
            ]
          }
        ]
      };
      typeChart.setOption(typeOption);
    }
    
    // 每日趋势图表
    if (dailyChartRef.value) {
      dailyChart = echarts.init(dailyChartRef.value);
      const dailyOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          type: 'scroll',
          bottom: 0,
          data: ['失物', '招领']
        },
        grid: {
          left: '6%',
          right: '6%',
          bottom: '16%',
          top: '8%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: dashboardData.value.dailyStats?.map(item => item.date) || [],
            axisLabel: {
              hideOverlap: true,
              rotate: 30
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '数量',
            minInterval: 1
          }
        ],
        series: [
          {
            name: '失物',
            type: 'bar',
            stack: 'total',
            emphasis: { focus: 'series' },
            data: dashboardData.value.dailyStats?.map(item => item.lostCount) || []
          },
          {
            name: '招领',
            type: 'bar',
            stack: 'total',
            emphasis: { focus: 'series' },
            data: dashboardData.value.dailyStats?.map(item => item.claimCount) || []
          }
        ]
      };
      dailyChart.setOption(dailyOption);
    }
  });
};

// 更新图表数据
const updateCharts = () => {
  if (typeChart) {
    typeChart.setOption({
      series: [{
        data: [
          { value: dashboardData.value.lostCount || 0, name: '失物' },
          { value: dashboardData.value.claimCount || 0, name: '招领' },
          { value: dashboardData.value.resolvedCount || 0, name: '已解决' },
          { value: dashboardData.value.pendingCount || 0, name: '待审核' }
        ]
      }]
    });
  }
  
  if (dailyChart) {
    dailyChart.setOption({
      xAxis: [{
        data: dashboardData.value.dailyStats?.map(item => item.date) || []
      }],
      series: [
        {
          data: dashboardData.value.dailyStats?.map(item => item.lostCount) || []
        },
        {
          data: dashboardData.value.dailyStats?.map(item => item.claimCount) || []
        }
      ]
    });
  }
};

onMounted(() => {
  fetchDashboardData();
  fetchMyItems();
  initCharts();
  setupEventListeners();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  cleanupEventListeners();
  // 销毁图表实例
  typeChart?.dispose();
  statusChart?.dispose();
  dailyChart?.dispose();
  window.removeEventListener('resize', handleResize);
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

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.chart {
  width: 100%;
  height: 360px;
}

.chart-card :deep(.el-card__body) {
  padding-bottom: 8px;
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