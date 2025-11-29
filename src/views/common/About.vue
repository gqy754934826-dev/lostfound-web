<template>
  <div class="about-page">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">关于我们</h1>
        <p class="page-subtitle">校园失物招领系统致力于为校园师生提供便捷的失物招领服务</p>
      </div>
    </div>

    <div class="content-section">
      <div class="container">
        <el-card class="section-card">
          <div class="card-header">
            <h2>项目介绍</h2>
          </div>
          <div class="card-content">
            <p>
              校园失物招领系统是一个专门为校园环境设计的在线平台，旨在帮助师生快速发布和查找失物信息。
              通过这个系统，用户可以轻松发布失物或招领信息，浏览他人发布的相关信息，并与发布者取得联系。
            </p>
            <p>
              我们的使命是通过技术手段减少校园内的失物损失，提高物品找回率，营造一个更加和谐、互助的校园环境。
            </p>
          </div>
        </el-card>

        <el-card class="section-card">
          <div class="card-header">
            <h2>核心功能</h2>
          </div>
          <div class="card-content">
            <el-row :gutter="20">
              <el-col :span="12" :xs="24" :sm="12">
                <div class="feature-item">
                  <el-icon class="feature-icon"><Document /></el-icon>
                  <h3>信息发布</h3>
                  <p>用户可以方便地发布失物或招领信息，包括物品描述、地点、时间等详细信息。</p>
                </div>
              </el-col>
              <el-col :span="12" :xs="24" :sm="12">
                <div class="feature-item">
                  <el-icon class="feature-icon"><Search /></el-icon>
                  <h3>信息搜索</h3>
                  <p>提供多种筛选条件，帮助用户快速找到相关的失物或招领信息。</p>
                </div>
              </el-col>
              <el-col :span="12" :xs="24" :sm="12">
                <div class="feature-item">
                  <el-icon class="feature-icon"><ChatDotRound /></el-icon>
                  <h3>即时沟通</h3>
                  <p>内置聊天系统，方便失主与拾到者直接沟通，提高物品找回效率。</p>
                </div>
              </el-col>
              <el-col :span="12" :xs="24" :sm="12">
                <div class="feature-item">
                  <el-icon class="feature-icon"><Check /></el-icon>
                  <h3>状态跟踪</h3>
                  <p>用户可以跟踪自己发布信息的状态，及时更新处理进度。</p>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <el-card class="section-card">
          <div class="card-header">
            <h2>开发团队</h2>
          </div>
          <div class="card-content">
            <div class="team-info">
              <p>
                校园失物招领系统由一支热爱技术、关注校园服务的开发团队创建和维护。
                我们致力于通过技术创新改善校园生活质量，为师生提供更好的服务体验。
              </p>
              <div class="contact-info">
                <h3>联系我们</h3>
                <ul>
                  <li><strong>邮箱：</strong>gqy2793157861@qq.com</li>
                  <li><strong>电话：</strong>18523235668</li>
                  <li><strong>地址：</strong>重庆市两江新区重庆外语外事学院</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="section-card">
          <div class="card-header">
            <h2>技术架构</h2>
          </div>
          <div class="card-content">
            <div class="tech-stack">
              <el-row :gutter="20">
                <el-col :span="8" :xs="24" :sm="12">
                  <div class="tech-category">
                    <h3>前端技术</h3>
                    <ul>
                      <li>Vue 3</li>
                      <li>Element Plus</li>
                      <li>Vite</li>
                      <li>Vue Router</li>
                    </ul>
                  </div>
                </el-col>
                <el-col :span="8" :xs="24" :sm="12">
                  <div class="tech-category">
                    <h3>后端技术</h3>
                    <ul>
                      <li>Spring Boot</li>
                      <li>MyBatis</li>
                      <li>Redis</li>
                      <li>JWT</li>
                    </ul>
                  </div>
                </el-col>
                <el-col :span="8" :xs="24" :sm="12">
                  <div class="tech-category">
                    <h3>部署环境</h3>
                    <ul>
                      <li>MySQL</li>
                      <li>Nginx</li>
                      <li>阿里云OSS</li>
                    </ul>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 返回主页按钮 -->
    <div class="return-home">
      <el-button type="primary" size="large" @click="goToHome">返回主页</el-button>
    </div>
  </div>
</template>

<script setup>
import { Document, Search, ChatDotRound, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
}

.header-actions {
  margin-top: 30px;
}

.content-section {
  padding: 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-card {
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border: none;
  transition: all 0.3s ease;
}

.section-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-header h2 {
  margin: 0 0 20px 0;
  font-size: 1.8rem;
  color: #303133;
  font-weight: 700;
  position: relative;
  padding-bottom: 15px;
}

.card-header h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(120deg, #409eff, #64b5f6);
  border-radius: 2px;
}

.card-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #606266;
  margin-bottom: 20px;
}

.feature-item {
  text-align: center;
  padding: 30px 20px;
  transition: all 0.3s ease;
  border-radius: 10px;
  margin-bottom: 20px;
}

.feature-item:hover {
  background: #f5f7fa;
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  color: #409eff;
  margin-bottom: 15px;
}

.feature-item h3 {
  font-size: 1.3rem;
  margin: 0 0 10px 0;
  color: #303133;
}

.feature-item p {
  font-size: 1rem;
  margin: 0;
  color: #909399;
}

.team-info p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #606266;
}

.contact-info h3 {
  font-size: 1.4rem;
  margin: 30px 0 15px 0;
  color: #303133;
}

.contact-info ul {
  list-style: none;
  padding: 0;
}

.contact-info li {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #606266;
}

.tech-stack {
  width: 100%;
}

.tech-category h3 {
  font-size: 1.3rem;
  margin: 0 0 15px 0;
  color: #303133;
}

.tech-category ul {
  list-style: none;
  padding: 0;
}

.tech-category li {
  font-size: 1rem;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
}

.tech-category li:last-child {
  border-bottom: none;
}

.return-home {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .header-section {
    padding: 60px 0;
  }
  
  .page-title {
    font-size: 2.2rem;
  }
  
  .page-subtitle {
    font-size: 1.2rem;
  }
  
  .content-section {
    padding: 40px 0;
  }
  
  .container {
    padding: 0 15px;
  }
  
  .card-header h2 {
    font-size: 1.5rem;
  }
  
  .feature-item {
    padding: 20px 15px;
  }
  
  .feature-icon {
    font-size: 2rem;
  }
  
  .header-actions {
    margin-top: 20px;
  }
  
  .header-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
  
  .return-home {
    padding: 30px 0;
  }
}
</style>