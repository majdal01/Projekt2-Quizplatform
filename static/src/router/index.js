import { createRouter, createWebHistory } from 'vue-router'
import { appStore } from '../stores/appStore'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import QuizView from '../views/QuizView.vue'
import HistoryView from '../views/HistoryView.vue'
import ResultsView from '../views/ResultsView.vue'
import LogView from '@/views/LogView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz/:id',
    name: 'quiz',
    component: QuizView,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
    meta: { requiresAuth: true }
  },
  {
    path: '/results',
    name: 'results',
    component: ResultsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/logs',
    name: 'logs',
    component: LogView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !appStore.isLoggedIn()) {
    return next('/login')
  }

  if (to.meta.requiresAdmin && !appStore.isAdmin()) {
    return next('/dashboard')
  }

  if ((to.path === '/login' || to.path === '/register') && appStore.isLoggedIn()) {
    return next('/dashboard')
  }

  next()
})

export default router


