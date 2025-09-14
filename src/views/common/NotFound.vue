<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-code">404</h1>
      <div class="not-found-message">页面不存在</div>
      <div class="not-found-desc">抱歉，您访问的页面不存在或已被删除</div>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
      <el-button @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 返回首页
const goHome = () => {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    router.push('/admin/dashboard');
  } else {
    router.push('/user/dashboard');
  }
};
</script>

<style scoped>
.not-found-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.not-found-content {
  text-align: center;
}

.not-found-code {
  font-size: 120px;
  color: #409EFF;
  margin: 0;
  line-height: 1.2;
}

.not-found-message {
  font-size: 24px;
  color: #303133;
  margin: 20px 0;
}

.not-found-desc {
  font-size: 16px;
  color: #909399;
  margin-bottom: 30px;
}

.el-button {
  margin: 0 10px;
}
</style>