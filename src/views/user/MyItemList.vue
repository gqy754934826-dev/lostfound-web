<template>
  <div class="item-list-container">
    <h2 class="page-title">我的发布</h2>
    
    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="请输入标题关键词" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 100px;">
            <el-option label="失物信息" value="lost" />
            <el-option label="招领信息" value="claim" />
          </el-select>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="queryParams.location" placeholder="请输入地点关键词" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 200px;">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
            <el-option label="已完成" :value="3" />
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
        <el-table-column prop="title" label="标题" width="180" />
        <el-table-column prop="type" label="类型" width="80" >
          <template #default="scope">
            <el-tag :type="scope.row.type === 'lost' ? 'danger' : 'success'">
              {{ scope.row.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="100" />
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
        <el-table-column prop="createTime" label="发布时间" width="140">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="修改时间" width="140">
          <template #default="scope">
            <span v-if="isModified(scope.row)">{{ formatDateTime(scope.row.updateTime) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
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
              v-if="scope.row.status !== 3" 
              size="small" 
              type="primary" 
              @click="editItem(scope.row.id)"
            >修改</el-button>
            <el-button 
              v-if="scope.row.status === 1" 
              size="small" 
              type="success" 
              @click="markAsResolved(scope.row.id)"
            >标记完成</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteItem(scope.row.id)"
            >删除</el-button>
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
import { getUserItemList, updateItemStatus, deleteItemById, completeItem } from '../../api/item';
import { formatDateTime } from '../../utils/dateUtils';

const router = useRouter();
const loading = ref(false);
const itemList = ref([]);
const total = ref(0);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  status: null,
  type: '',
  title: '',
  location: ''
});

// 获取信息列表
const fetchItemList = async () => {
  loading.value = true;
  try {
    const res = await getUserItemList(queryParams);
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
  queryParams.status = null;
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

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    case 3: return '已完成';
    default: return '未知';
  }
};

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info';
    case 1: return 'success';
    case 2: return 'danger';
    case 3: return 'warning';
    default: return 'info';
  };
};

// 判断是否被修改过（发布时间和修改时间不同）
const isModified = (item) => {
  if (!item.createTime || !item.updateTime) return false;
  return new Date(item.createTime).getTime() !== new Date(item.updateTime).getTime();
};

// 查看信息详情
const viewItemDetail = (id) => {
  router.push(`/user/item/detail/${id}`);
};

// 编辑信息
const editItem = (id) => {
  router.push(`/user/item/edit/${id}`);
};

// 标记为已完成
const markAsResolved = (id) => {
  ElMessageBox.confirm('确定要将该信息标记为已完成吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await completeItem(id);
      ElMessage.success('操作成功');
      fetchItemList();
    } catch (error) {
      console.error('操作失败:', error);
    }
  }).catch(() => {});
};

// 删除信息
const deleteItem = (id) => {
  ElMessageBox.confirm('确定要删除该信息吗? 删除后无法恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteItemById(id);
      ElMessage.success('删除成功');
      fetchItemList();
    } catch (error) {
      console.error('删除失败:', error);
    }
  }).catch(() => {});
};

onMounted(() => {
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

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
}
</style>