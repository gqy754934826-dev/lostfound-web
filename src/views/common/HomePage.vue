<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <h2>校园失物招领系统</h2>
        </div>
        <div class="navbar-actions">
          <el-button v-if="!isLoggedIn" @click="goToLogin" class="nav-btn">登录</el-button>
          <el-button v-if="!isLoggedIn" type="primary" @click="goToRegister" class="nav-btn primary">注册</el-button>
          <el-dropdown v-if="isLoggedIn" @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userAvatar || defaultAvatar"></el-avatar>
              <span class="username">{{ userName }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="dashboard">我的主页</el-dropdown-item>
                <el-dropdown-item command="publish">发布信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 顶部横幅 -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">校园失物招领系统</h1>
        <p class="hero-subtitle">让失物找到主人，让拾物找到失主</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goToLogin" v-if="!isLoggedIn" class="hero-btn">
            立即登录
          </el-button>
          <el-button type="success" size="large" @click="goToPublish" v-if="isLoggedIn" class="hero-btn">
            发布信息
          </el-button>
          <el-button size="large" @click="scrollToItems" class="hero-btn secondary">
            浏览信息
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-container">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon">
            <el-icon :size="32"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section" ref="filterSection">
      <el-card class="filter-card">
        <div class="filter-header">
          <h3>查找物品</h3>
        </div>
        <el-form :inline="true" :model="queryParams" class="filter-form">
          <el-form-item label="类型">
            <el-radio-group v-model="queryParams.type" @change="handleQuery">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="lost">失物信息</el-radio-button>
              <el-radio-button label="claim">招领信息</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入标题关键词"
              clearable
              class="search-input"
              @keyup.enter="handleQuery"
            >
              <template #prefix>
                <el-icon><search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="地点">
            <el-input
              v-model="queryParams.location"
              placeholder="请输入地点"
              clearable
              class="location-input"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery" class="action-btn">查询</el-button>
            <el-button @click="resetQuery" class="action-btn secondary">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 信息列表 -->
    <div class="items-section">
      <div class="section-header">
        <h2 class="section-title">最新信息</h2>
        <el-button text @click="refreshItems" :loading="loading" class="refresh-btn">
          <el-icon><refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && itemList.length === 0" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && itemList.length === 0" description="暂无信息" class="empty-state">
        <el-button type="primary" @click="goToPublish" v-if="isLoggedIn">发布第一条信息</el-button>
      </el-empty>

      <!-- 卡片列表 -->
      <div class="items-grid" v-if="itemList.length > 0">
        <el-card
          v-for="item in itemList"
          :key="item.id"
          class="item-card"
          shadow="hover"
          @click="viewItemDetail(item.id)"
        >
          <div class="item-image-container">
            <el-image
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :preview-src-list="[item.imageUrl]"
              fit="cover"
              class="item-image"
              lazy
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="image-placeholder">
              <el-icon><picture /></el-icon>
            </div>
            <el-tag
              :type="item.type === 'lost' ? 'danger' : 'success'"
              class="item-type-tag"
            >
              {{ item.type === 'lost' ? '失物' : '招领' }}
            </el-tag>
          </div>
          <div class="item-content">
            <h3 class="item-title" :title="item.title">{{ item.title }}</h3>
            <div class="item-meta">
              <div class="item-meta-item">
                <el-icon><location /></el-icon>
                <span>{{ item.location || '未填写' }}</span>
              </div>
              <div class="item-meta-item">
                <el-icon><user /></el-icon>
                <span>{{ item.username || '匿名' }}</span>
              </div>
              <div class="item-meta-item">
                <el-icon><clock /></el-icon>
                <span>{{ formatTime(item.createTime) }}</span>
              </div>
            </div>
            <div class="item-description" v-if="item.description">
              {{ truncateText(item.description, 80) }}
            </div>
            <div class="item-footer">
              <el-tag
                :type="getStatusType(item.status)"
                size="small"
              >
                {{ getStatusText(item.status) }}
              </el-tag>
              <el-button
                type="primary"
                size="small"
                @click.stop="contactPublisher(item.userId)"
                v-if="isLoggedIn && item.userId !== currentUserId"
                class="contact-btn"
              >
                联系发布者
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination"
        />
      </div>
    </div>

    <!-- 底部 -->
    <footer class="footer-section">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#" @click.prevent="goToAbout">关于</a>
          <a href="#" @click.prevent="goToContact">联系我们</a>
        </div>
        <p class="copyright">© 2025 校园失物招领系统. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  Picture,
  Location,
  User,
  Clock,
  ArrowDown,
  Document,
  Collection,
  CircleCheck
} from '@element-plus/icons-vue';
import { getItemList } from '../../api/item';
import { getUserInfo, logout } from '../../api/user';
import { formatDateTime } from '../../utils/dateUtils';

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

const router = useRouter();
const loading = ref(false);
const itemList = ref([]);
const total = ref(0);
// 首页仅展示已对外公开的数据统计，不展示待审核/待处理
const stats = ref([
  { label: '公开失物信息', value: 0, icon: Document },
  { label: '公开招领信息', value: 0, icon: Collection },
  { label: '已解决信息', value: 0, icon: CircleCheck }
]);
const filterSection = ref(null);
const currentUserId = ref(null);
const userName = ref('');
const userAvatar = ref('');
const publicRequestOptions = {
  skipAuthRedirect: true,
  catchError: true
};

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 12,
  status: 1, // 只显示已通过审核的信息
  type: '',
  title: '',
  location: ''
});

// 是否已登录
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token');
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

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDateTime(time);
};

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 获取信息列表
const fetchItemList = async () => {
  loading.value = true;
  try {
    const res = await getItemList(queryParams, { ...publicRequestOptions });
    itemList.value = res.data.list || [];
    total.value = res.data.total || 0;
  } catch (error) {
    if (error?.code === 401) {
      itemList.value = [];
      total.value = 0;
    } else {
      console.error('获取信息列表失败:', error);
      ElMessage.error('获取信息列表失败');
    }
  } finally {
    loading.value = false;
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const getTotal = async (params) => {
      try {
        const res = await getItemList(
          {
            pageNum: 1,
            pageSize: 1,
            ...params
          },
          { ...publicRequestOptions }
        );
        return res?.data?.total || 0;
      } catch (error) {
        if (error?.code === 401) {
          return 0;
        }
        throw error;
      }
    };

    const [lostTotal, claimTotal, resolvedTotal] = await Promise.all([
      getTotal({ status: 1, type: 'lost' }),
      getTotal({ status: 1, type: 'claim' }),
      getTotal({ status: 3 })
    ]);

    stats.value[0].value = lostTotal;
    stats.value[1].value = claimTotal;
    stats.value[2].value = resolvedTotal;
  } catch (error) {
    console.error('获取统计数据失败:', error);
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
  if (isLoggedIn.value) {
    router.push(`/user/item/detail/${id}`);
  } else {
    ElMessage.warning('请先登录查看详情');
    router.push('/user/login');
  }
};

// 联系发布者
const contactPublisher = (userId) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先注册/登录后再联系发布者');
    router.push('/user/register');
    return;
  }
  const publisherId = Number(userId);
  router.push(`/user/chat?userId=${publisherId}`);
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/user/login');
};

// 跳转到发布页面
const goToPublish = () => {
  router.push('/user/item/publish');
};

// 跳转到注册页面
const goToRegister = () => {
  router.push('/user/register');
};

// 跳转到主页
const goToHome = () => {
  router.push('/');
};

// 关于页面
const goToAbout = () => {
  router.push('/about');
};

// 联系我们
const goToContact = () => {
  ElMessage.info('联系方式：gqy2793157861@qq.com');
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'dashboard') {
    router.push('/user/dashboard');
  } else if (command === 'publish') {
    router.push('/user/item/publish');
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await logout();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        userName.value = '';
        userAvatar.value = '';
        currentUserId.value = null;
        ElMessage.success('退出登录成功');
        // 刷新页面数据
        fetchItemList();
        fetchStats();
      } catch (error) {
        console.error('退出登录失败:', error);
        ElMessage.error('退出登录失败，请重试');
      }
    }).catch(() => {});
  }
};

// 获取用户信息
const fetchUserInfo = async () => {
  if (!isLoggedIn.value) return;
  try {
    const res = await getUserInfo();
    if (res && res.data) {
      userName.value = res.data.realName || res.data.username || '用户';
      userAvatar.value = res.data.avatarUrl || '';
      currentUserId.value = res.data.id;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 滚动到信息列表
const scrollToItems = () => {
  if (filterSection.value) {
    filterSection.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// 刷新列表
const refreshItems = () => {
  fetchItemList();
  fetchStats();
};

onMounted(() => {
  // 获取当前用户ID
  const userId = localStorage.getItem('userId');
  if (userId) {
    currentUserId.value = parseInt(userId);
  }

  // 如果已登录，获取用户信息
  if (isLoggedIn.value) {
    fetchUserInfo();
  }

  // 初始化数据
  fetchItemList();
  fetchStats();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}

/* 顶部导航栏 */
.top-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand h2 {
  margin: 0;
  font-size: 24px;
  color: #409eff;
  font-weight: 700;
  background: linear-gradient(120deg, #409eff, #64b5f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-btn {
  border-radius: 20px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn.primary {
  background: linear-gradient(120deg, #409eff, #64b5f6);
  border: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 30px;
  transition: background-color 0.3s;
  background: rgba(64, 158, 255, 0.1);
}

.user-info:hover {
  background: rgba(64, 158, 255, 0.2);
}

.username {
  color: #303133;
  font-size: 15px;
  font-weight: 500;
}

/* 顶部横幅 */
.hero-section {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.2;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 0 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0 0 40px 0;
  opacity: 0.95;
  animation: fadeInUp 1s ease 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease 0.4s both;
}

.hero-btn {
  border-radius: 30px;
  padding: 15px 35px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.hero-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.hero-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 统计信息 */
.stats-section {
  padding: 50px 0;
  background: white;
}

.stats-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.stat-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #409eff, #64b5f6);
  color: white;
  margin-right: 20px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1.1rem;
  color: #909399;
}

/* 筛选栏 */
.filter-section {
  max-width: 1400px;
  margin: 0 auto 50px;
  padding: 0 30px;
}

.filter-card {
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.filter-header {
  margin-bottom: 20px;
}

.filter-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
  font-weight: 600;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.search-input, .location-input {
  min-width: 200px;
}

.action-btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
}

.action-btn.secondary {
  background: #f5f7fa;
  border-color: #dcdfe6;
}

/* 信息列表 */
.items-section {
  max-width: 1400px;
  margin: 0 auto 60px;
  padding: 0 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #303133;
  margin: 0;
  position: relative;
  padding-bottom: 15px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(120deg, #409eff, #64b5f6);
  border-radius: 2px;
}

.refresh-btn {
  color: #909399;
  font-weight: 500;
}

.refresh-btn:hover {
  color: #409eff;
}

.loading-container {
  padding: 40px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

/* 卡片网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.item-card {
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.item-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.item-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(120deg, #e0e7ff, #dbeafe);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.item-card:hover .item-image {
  transform: scale(1.05);
}

.image-placeholder,
.image-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #e0e7ff, #dbeafe);
  color: #94a3b8;
  font-size: 48px;
}

.item-type-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  font-weight: bold;
  border-radius: 20px;
  padding: 5px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.item-content {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #303133;
  margin: 0 0 15px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #909399;
}

.item-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-description {
  font-size: 0.95rem;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.contact-btn {
  border-radius: 6px;
  padding: 6px 15px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination {
  padding: 15px 25px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

/* 底部 */
.footer-section {
  background: #1d2129;
  color: #e5eaf3;
  padding: 50px 0 30px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  text-align: center;
}

.footer-links {
  margin-bottom: 30px;
}

.footer-links a {
  color: #e5eaf3;
  margin: 0 15px;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 1.1rem;
}

.footer-links a:hover {
  color: #409eff;
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
  color: #999;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .hero-section {
    height: 400px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 15px;
    height: 60px;
  }
  
  .navbar-brand h2 {
    font-size: 20px;
  }
  
  .hero-section {
    height: 350px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-btn {
    padding: 12px 25px;
    font-size: 1rem;
  }
  
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-form .el-form-item {
    margin-bottom: 10px;
  }
  
  .search-input, .location-input {
    min-width: auto;
  }
  
  .section-title {
    font-size: 1.7rem;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .footer-links a {
    display: block;
    margin: 10px 0;
  }
}

@media (max-width: 480px) {
  .hero-section {
    height: 300px;
  }
  
  .hero-title {
    font-size: 1.7rem;
  }
  
  .hero-content {
    padding: 0 15px;
  }
  
  .stats-container {
    padding: 0 15px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .filter-section, .items-section {
    padding: 0 15px;
  }
  
  .item-content {
    padding: 20px;
  }
}
</style>