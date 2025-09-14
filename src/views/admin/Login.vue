<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>校园失物招领系统</h2>
        <p>管理员登录</p>
      </div>
      
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="管理员账号" />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password" placeholder="密码" show-password />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">登录</el-button>
        </el-form-item>
        
        <div class="login-options">
          <el-link type="info" @click="goToUserLogin">用户登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '../../api/admin';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 清除localStorage中的所有数据
        localStorage.clear();
        
        const res = await login(loginForm);
        // 保存token和角色
        localStorage.setItem('token', res.data);
        localStorage.setItem('role', 'admin');
        
        ElMessage.success('登录成功');
        
        // 跳转到管理员仪表盘
        router.push('/admin/dashboard');
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 跳转到用户登录页面
const goToUserLogin = () => {
  router.push('/user/login');
};
</script>

<style scoped>
.login-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg');
  background-repeat: no-repeat;
  background-position: center 110px;
  background-size: 100%;
}

.login-card {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>