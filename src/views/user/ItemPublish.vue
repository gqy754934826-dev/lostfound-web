<template>
  <div class="publish-container">
    <h2 class="page-title">{{ isLost ? '发布失物信息' : '发布招领信息' }}</h2>
    
    <el-card class="publish-card">
      <el-form :model="itemForm" :rules="itemRules" ref="itemFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="itemForm.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="itemForm.type">
            <el-radio label="lost">失物信息</el-radio>
            <el-radio label="claim">招领信息</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="地点" prop="location">
          <el-input v-model="itemForm.location" placeholder="请输入地点" />
        </el-form-item>
        
        <el-form-item label="时间" prop="itemTime">
          <el-date-picker
            v-model="itemForm.itemTime"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="itemForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述物品信息，如特征、颜色、型号等"
          />
        </el-form-item>
        
        <el-form-item label="图片">
          <el-upload
            class="item-image-uploader"
            action="#"
            :http-request="uploadImage"
            :show-file-list="false"
            :before-upload="beforeImageUpload">
            <img v-if="itemForm.imageUrl" :src="itemForm.imageUrl" class="item-image" />
            <el-icon v-else class="item-image-uploader-icon"><plus /></el-icon>
          </el-upload>
          <div class="upload-tip">提示：请上传清晰的物品照片，大小不超过2MB</div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handlePublish">发布</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { publishItem, uploadItemImage } from '../../api/item';

const router = useRouter();
const route = useRoute();
const itemFormRef = ref(null);
const loading = ref(false);

// 表单数据
const itemForm = reactive({
  title: '',
  type: 'lost', // 默认为失物信息
  location: '',
  itemTime: '',
  description: '',
  imageUrl: ''
});

// 计算是否为失物信息
const isLost = computed(() => itemForm.type === 'lost');

// 表单验证规则
const itemRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入地点', trigger: 'blur' }
  ],
  itemTime: [
    { required: true, message: '请选择时间', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
};

// 上传图片前的验证
const beforeImageUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

// 上传图片
const uploadImage = async (options) => {
  try {
    const res = await uploadItemImage(options.file);
    itemForm.imageUrl = res.data;
    ElMessage.success('上传成功');
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  }
};

// 处理发布
const handlePublish = () => {
  itemFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await publishItem(itemForm);
        ElMessage.success('发布成功，等待审核');
        router.push('/user/dashboard');
      } catch (error) {
        console.error('发布失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  // 从路由参数中获取类型
  const type = route.query.type;
  if (type && (type === 'lost' || type === 'claim')) {
    itemForm.type = type;
  }
  
  // 设置默认时间为当前时间
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  itemForm.itemTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
});
</script>

<style scoped>
.publish-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.publish-card {
  margin-bottom: 20px;
}

.item-image-uploader {
  display: flex;
  justify-content: center;
}

.item-image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.item-image-uploader .el-upload:hover {
  border-color: #409EFF;
}

.item-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.item-image {
  width: 178px;
  height: 178px;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>