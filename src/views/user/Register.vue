<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>校园失物招领系统</h2>
        <p>用户注册</p>
      </div>
      
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" class="register-form" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
        
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="registerForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="registerForm.studentNo" placeholder="请输入学号" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="头像" prop="avatarUrl">
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="uploadAvatar"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload">
            <img v-if="registerForm.avatarUrl" :src="registerForm.avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister">注册</el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { register } from '../../api/user';
import { updateAvatar } from '../../api/user';

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false);

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  studentNo: '',
  phone: '',
  avatarUrl: ''
});

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value.validateField('confirmPassword');
    }
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 处理注册
const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 删除确认密码字段
        const registerData = { ...registerForm };
        delete registerData.confirmPassword;
        
        const res = await register(registerData);
        ElMessage.success('注册成功，请登录');
        
        // 跳转到登录页
        router.push('/user/login');
      } catch (error) {
        console.error('注册失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 上传头像前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

// 上传头像
const uploadAvatar = async (options) => {
  try {
    // 模拟上传到OSS的过程，实际项目中应该调用后端接口
    // 这里假设已经有了一个临时token可以直接上传
    const res = await updateAvatar(options.file);
    registerForm.avatarUrl = res.data;
    ElMessage.success('上传成功');
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  }
};

// 跳转到登录页面
const goToLogin = () => {
  router.push('/user/login');
};
</script>

<style scoped>
.register-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.register-card {
  width: 500px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.register-header p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.register-form {
  margin-top: 20px;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>