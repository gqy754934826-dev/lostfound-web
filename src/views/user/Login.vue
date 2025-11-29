<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>校园失物招领系统</h2>
        <p>用户登录</p>
      </div>
      
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="用户名" />        
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password" placeholder="密码" show-password />        
        </el-form-item>
        
        <el-form-item prop="captcha">
          <el-input 
            v-model="loginForm.captcha" 
            placeholder="验证码" 
            class="captcha-input"
            @keyup.enter="handleLogin"
          >
            <template #append>
              <div class="captcha-wrapper">
                <img 
                  :src="captchaUrl" 
                  @click="refreshCaptcha" 
                  alt="验证码" 
                  class="captcha-image" 
                  title="点击刷新验证码"
                >
              </div>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">登录</el-button>
        </el-form-item>
        
        <div class="login-options">
          <el-link type="primary" @click="goToRegister">没有账号？立即注册</el-link>
          <el-link type="info" @click="goToAdminLogin">管理员登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login, getUserInfo, getCaptcha } from '../../api/user';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);
const captchaUrl = ref('');

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
};

// 刷新验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha();
    captchaUrl.value = res.data;
  } catch (error) {
    console.error('获取验证码失败:', error);
    ElMessage.error('获取验证码失败');
  }
};

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await login(loginForm);
        // 保存token和角色
        localStorage.setItem('token', res.data);
        localStorage.setItem('role', 'user');
        
        // 获取用户信息并保存用户ID
        try {
          const userInfoRes = await getUserInfo();
          if (userInfoRes.data && userInfoRes.data.id) {
            localStorage.setItem('userId', userInfoRes.data.id);
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
        
        ElMessage.success('登录成功');
        
        // 跳转到首页展示页面
        router.push('/');
      } catch (error) {
        console.error('登录失败:', error);
        ElMessage.error(error.message || '登录失败');
        // 登录失败时刷新验证码
        refreshCaptcha();
      } finally {
        loading.value = false;
      }
    }
  });
};

// 跳转到注册页面
const goToRegister = () => {
  router.push('/user/register');
};

// 跳转到管理员登录页面
const goToAdminLogin = () => {
  if (window.location.pathname !== '/') {
    window.location.href = `/#/admin/login`;
  } else {
    router.push('/admin/login');
  }
};

// 组件挂载时获取验证码
onMounted(() => {
  refreshCaptcha();
});
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

.captcha-input {
  width: 100%;
}

.captcha-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
}

.captcha-image {
  cursor: pointer;
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 0.2s;
  border: none;
  margin: 0;
  padding: 0;
}

.captcha-image:hover {
  transform: scale(1.05);
}

.login-button {
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

@media (max-width: 500px) {
  .login-card {
    width: 90%;
    padding: 20px;
  }
}
</style>