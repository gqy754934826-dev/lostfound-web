<template>
  <div class="item-audit-container">
    <h2 class="page-title">信息审核</h2>
    
    <!-- 筛选 -->
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
    
    <!-- 待审核信息列表 -->
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
            <el-button size="small" type="success" @click="approveItem(scope.row.id)">通过</el-button>
            <el-button size="small" type="danger" @click="rejectItem(scope.row.id)">拒绝</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPendingItemList, updateItemStatus } from '../../api/item';

const router = useRouter();
const loading = ref(false);
const itemList = ref([]);
const total = ref(0);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  type: ''
});

// 获取待审核信息列表
const fetchPendingItems = async () => {
  loading.value = true;
  try {
    const res = await getPendingItemList(queryParams);
    itemList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    console.error('获取待审核信息列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchPendingItems();
};

// 重置查询
const resetQuery = () => {
  queryParams.type = '';
  queryParams.pageNum = 1;
  fetchPendingItems();
};

// 处理每页条数变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  fetchPendingItems();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val;
  fetchPendingItems();
};

// 查看信息详情
const viewItemDetail = (id) => {
  router.push(`/admin/item/detail/${id}`);
};

// 通过信息
const approveItem = (id) => {
  ElMessageBox.confirm('确定要通过该信息吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateItemStatus(id, 1);
      ElMessage.success('审核通过成功');
      fetchPendingItems();
    } catch (error) {
      console.error('操作失败:', error);
    }
  }).catch(() => {});
};

// 拒绝信息
const rejectItem = (id) => {
  ElMessageBox.confirm('确定要拒绝该信息吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateItemStatus(id, 2);
      ElMessage.success('审核拒绝成功');
      fetchPendingItems();
    } catch (error) {
      console.error('操作失败:', error);
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchPendingItems();
});
</script>

<style scoped>
.item-audit-container {
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