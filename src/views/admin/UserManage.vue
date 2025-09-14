<template>
  <div class="user-manage-container">
    <h2 class="page-title">用户管理</h2>
    
    <!-- 用户列表 -->
    <el-card class="user-card">
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="studentNo" label="学号" width="150" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column label="头像" width="100">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatarUrl || defaultAvatar"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              size="small" 
              :type="scope.row.status === 0 ? 'danger' : 'success'"
              @click="updateUserStatus(scope.row)"
            >
              {{ scope.row.status === 0 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserList, updateUserStatus as apiUpdateUserStatus } from '../../api/admin';

const loading = ref(false);
const userList = ref([]);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await getUserList();
    userList.value = res.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 更新用户状态
const updateUserStatus = (user) => {
  const newStatus = user.status === 0 ? 1 : 0;
  const statusText = newStatus === 0 ? '启用' : '禁用';
  
  ElMessageBox.confirm(`确定要${statusText}用户 ${user.username} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiUpdateUserStatus(user.id, newStatus);
      ElMessage.success(`${statusText}成功`);
      fetchUserList();
    } catch (error) {
      console.error('操作失败:', error);
    }
  }).catch(() => {});
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped>
.user-manage-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.user-card {
  margin-bottom: 20px;
}
</style>