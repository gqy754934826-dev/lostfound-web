import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';

// 用户端页面
import UserLayout from '../views/user/Layout.vue';
import UserLogin from '../views/user/Login.vue';
import UserRegister from '../views/user/Register.vue';
import UserDashboard from '../views/user/Dashboard.vue';
import UserItemList from '../views/user/ItemList.vue';
import UserItemPublish from '../views/user/ItemPublish.vue';
import UserChat from '../views/user/Chat.vue';
import UserProfile from '../views/user/Profile.vue';

// 管理员端页面
import AdminLayout from '../views/admin/Layout.vue';
import AdminLogin from '../views/admin/Login.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import AdminItemAudit from '../views/admin/ItemAudit.vue';
import AdminUserManage from '../views/admin/UserManage.vue';

// 公共页面
import ItemDetail from '../views/common/ItemDetail.vue';
import NotFound from '../views/common/NotFound.vue';

const routes = [
  {
    path: '/',
    redirect: '/user/login'
  },
  {
    path: '/user/login',
    name: 'UserLogin',
    component: UserLogin,
    meta: { title: '用户登录' }
  },
  {
    path: '/user/register',
    name: 'UserRegister',
    component: UserRegister,
    meta: { title: '用户注册' }
  },
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'UserDashboard',
        component: UserDashboard,
        meta: { title: '用户仪表盘', requireAuth: true }
      },
      {
        path: 'item/list',
        name: 'UserItemList',
        component: UserItemList,
        meta: { title: '信息大厅', requireAuth: true }
      },
      {
        path: 'item/publish',
        name: 'UserItemPublish',
        component: UserItemPublish,
        meta: { title: '发布信息', requireAuth: true }
      },
      {
        path: 'item/my',
        name: 'MyItemList',
        component: () => import('../views/user/MyItemList.vue'),
        meta: { title: '我的发布', requireAuth: true }
      },
      {
        path: 'item/edit/:id',
        name: 'ItemEdit',
        component: () => import('../views/user/ItemEdit.vue'),
        meta: { title: '编辑信息', requireAuth: true }
      },
      {
        path: 'chat',
        name: 'UserChat',
        component: UserChat,
        meta: { title: '消息中心', requireAuth: true }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: { title: '个人中心', requireAuth: true }
      },
      {
        path: 'item/detail/:id',
        name: 'UserItemDetail',
        component: ItemDetail,
        meta: { title: '信息详情', requireAuth: true }
      }
    ]
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { title: '管理员仪表盘', requireAuth: true, isAdmin: true }
      },
      {
        path: 'item/audit',
        name: 'AdminItemAudit',
        component: AdminItemAudit,
        meta: { title: '信息审核', requireAuth: true, isAdmin: true }
      },
      {
        path: 'item/list',
        name: 'AdminItemList',
        component: () => import('../views/admin/ItemList.vue'),
        meta: { title: '发布信息列表', requireAuth: true, isAdmin: true }
      },
      {
        path: 'user/manage',
        name: 'AdminUserManage',
        component: AdminUserManage,
        meta: { title: '用户管理', requireAuth: true, isAdmin: true }
      },
      {
        path: 'item/detail/:id',
        name: 'AdminItemDetail',
        component: ItemDetail,
        meta: { title: '信息详情', requireAuth: true, isAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面不存在' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 校园失物招领系统` : '校园失物招领系统';
  
  // 判断是否需要登录权限
  if (to.meta.requireAuth) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      // 未登录，跳转到登录页
      if (to.path.startsWith('/admin')) {
        next({ name: 'AdminLogin' });
      } else {
        next({ name: 'UserLogin' });
      }
      return;
    }
    
    // 判断是否是管理员权限
    if (to.meta.isAdmin && role !== 'admin') {
      next({ name: 'UserDashboard' });
      return;
    }
    
    // 判断是否是用户权限
    if (!to.meta.isAdmin && role !== 'user') {
      next({ name: 'AdminDashboard' });
      return;
    }
  }
  
  next();
});

export default router;