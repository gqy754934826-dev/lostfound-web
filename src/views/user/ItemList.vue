<template>
  <div class="item-list-container">
    <h2 class="page-title">信息大厅</h2>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable>
            <el-option label="失物信息" value="lost" />
            <el-option label="招领信息" value="claim" />
          </el-select>
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
        <el-table-column prop="title" label="标题" width="250" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'lost' ? 'danger' : 'success'">
              {{ scope.row.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="150" />
        <el-table-column prop="createTime" label="发布时间" width="180" />
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getItemList } from '../../api/item';

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
  type: ''
});

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
  router.push(`/user/chat?userId=${userId}`);
};

onMounted(() => {
  // 获取当前用户ID
  const userId = localStorage.getItem('userId');
  if (userId) {
    currentUserId.value = parseInt(userId);
  }
  
  fetchItemList();
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
</style>