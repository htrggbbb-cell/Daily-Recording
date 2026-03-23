import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout.vue'),
    redirect: '/food',
    children: [
      {
        path: 'food',
        name: 'Food',
        component: () => import('../views/Food.vue')
      },
      {
        path: 'study',
        name: 'Study',
        component: () => import('../views/Study.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.path !== '/login' && to.path !== '/register' && !userStore.isLogin) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && userStore.isLogin) {
    next('/')
  } else {
    next()
  }
})

export default router
