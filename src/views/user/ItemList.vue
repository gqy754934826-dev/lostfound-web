<template>
  <div class="item-list-container">
    <h2 class="page-title">信息大厅</h2>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入标题关键词" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 100px;">
            <el-option label="失物信息" :value="'lost'" />
            <el-option label="招领信息" :value="'claim'" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 200px;">
            <el-option label="已通过" :value="1" />
            <el-option label="已解决" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="queryParams.location" placeholder="请输入地点关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 信息列表 -->
    <el-card class="item-card">
      <el-table :data="itemList" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" width="180" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'lost' ? 'danger' : 'success'">
              {{ scope.row.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="100" />
        <el-table-column prop="username" label="发布者" width="100" />
        <el-table-column label="图片" width="100">
          <template #default="scope">
            <el-image 
              v-if="scope.row.imageUrl" 
              :src="scope.row.imageUrl" 
              :preview-src-list="[scope.row.imageUrl]" 
              fit="cover"
              class="item-image"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="140" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="viewItemDetail(scope.row.id)">查看详情</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="contactPublisher(scope.row.userId)"
              v-if="scope.row.userId !== currentUserId"
            >联系发布者</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getItemList } from '../../api/item';
import eventBus from '../../utils/eventBus';

const router = useRouter();
const loading = ref(false);
const itemList = ref([]);
const total = ref(0);
const currentUserId = ref(null);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  status: 1, // 只查询已通过审核的信息
  type: '',
  title: '',
  location: ''
});

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info';
    case 1: return 'success';
    case 2: return 'danger';
    case 3: return 'warning';
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

// 获取信息列表
const fetchItemList = async () => {
  loading.value = true;
  try {
    const res = await getItemList(queryParams);
    itemList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    console.error('获取信息列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchItemList();
};

// 重置查询
const resetQuery = () => {
  queryParams.type = '';
  queryParams.status = 1;
  queryParams.title = '';
  queryParams.location = '';
  queryParams.pageNum = 1;
  fetchItemList();
};

// 处理每页条数变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  fetchItemList();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  fetchItemList();
};

// 查看信息详情
const viewItemDetail = (id) => {
  router.push(`/user/item/detail/${id}`);
};

// 联系发布者
const contactPublisher = (userId) => {
  // 确保userId是数字类型
  const publisherId = Number(userId);
  console.log('联系发布者，publisherId类型:', typeof publisherId, '值:', publisherId);
  router.push(`/user/chat?userId=${publisherId}`);
};

// 监听事件
const setupEventListeners = () => {
  eventBus.on('item-status-updated', () => {
    console.log('[ItemList] 收到 item-status-updated 事件，刷新列表');
    fetchItemList();
  });
};

// 清理事件监听
const cleanupEventListeners = () => {
  eventBus.off('item-status-updated');
};

onMounted(() => {
  // 获取当前用户ID
  const userId = localStorage.getItem('userId');
  if (userId) {
    currentUserId.value = parseInt(userId);
  }

  // 设置默认值以确保选择框显示正确
  queryParams.type = 'lost'; // 默认显示失物信息
  queryParams.status = 1; // 默认显示已通过状态

  fetchItemList();
  
  // 设置事件监听
  setupEventListeners();
});

onUnmounted(() => {
  // 清理事件监听
  cleanupEventListeners();
});
</script>

<style scoped>
.item-list-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  align-items: center;
}

.item-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
}
</style>