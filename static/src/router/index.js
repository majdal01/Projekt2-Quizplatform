import { createRouter, createWebHistory } from 'vue-router'
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
    component: DashboardView
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: QuizView
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView
  },
  {
    path: '/results',
    name: 'results',
    component: ResultsView
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

export default router

