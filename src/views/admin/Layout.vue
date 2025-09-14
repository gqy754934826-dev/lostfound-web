<template>
  <div class="app-container">
    <!-- 顶部栏 -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">校园失物招领系统 - 管理端</h1>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand" v-if="adminInfo">
          <span class="el-dropdown-link">
            <el-avatar :size="32" icon="el-icon-user"></el-avatar>
            <span class="username">{{ adminInfo.realName || adminInfo.username }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    
    <div class="app-main">
      <!-- 左侧导航栏 -->
      <div class="app-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF">
          <el-menu-item index="/admin/dashboard">
            <el-icon><odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/item/audit">
            <el-icon><document-checked /></el-icon>
            <span>信息审核</span>
          </el-menu-item>
          <el-menu-item index="/admin/user/manage">
            <el-icon><user /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 右侧内容区 -->
      <div class="app-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Odometer, DocumentChecked, User } from '@element-plus/icons-vue';
import { getAdminInfo } from '../../api/admin';

const router = useRouter();
const route = useRoute();
const adminInfo = ref(null);

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 获取管理员信息
const fetchAdminInfo = async () => {
  try {
    const res = await getAdminInfo();
    adminInfo.value = res.data;
  } catch (error) {
    console.error('获取管理员信息失败:', error);
  }
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 清除token和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // 跳转到登录页
      router.push('/admin/login');
      
      ElMessage.success('退出登录成功');
    }).catch(() => {});
  }
};

onMounted(() => {
  fetchAdminInfo();
});
</script>

<style scoped>
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar {
  width: 200px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.app-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style>