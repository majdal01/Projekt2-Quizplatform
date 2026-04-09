<template>
  <div class="container">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>Logget ind som: {{ appStore.user?.username }}</p>
        <p>Rolle: {{ appStore.user?.role }}</p>
      </div>

      <button
        v-if="appStore.user?.role === 'admin'"
        class="btn-primary"
        @click="$router.push('/admin/upload')"
      >
        Upload quiz
      </button>
    </div>

    <div class="card-grid">
      <div class="card quiz-card">
        <div>
          <h3>Test din viden i Express</h3>
          <p>Tag quizzen og test din viden om Express.</p>
        </div>

        <div class="quiz-card-actions">
          <button class="btn-success" @click="$router.push('/quiz')">
            Tag quiz
          </button>

          <button
            v-if="appStore.user?.role === 'admin'"
            class="btn-warning"
            @click="$router.push('/admin/delete')"
          >
            Slet quiz
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard-actions">
     <button class="btn-info" @click="goToResults">
  {{ appStore.user?.role === 'admin' ? 'Se log' : 'Se mine resultater' }}
</button>

      <button class="logout-btn" @click="handleLogout">
        Log ud
      </button>
    </div>
  </div>
</template>

<script>
import { appStore } from '../stores/appStore'

export default {
  name: 'DashboardView',
  data() {
    return {
      appStore
    }
  },
  methods: {
    handleLogout() {
      appStore.logout()
      this.$router.push('/login')
    },
    goToResults() {
    if (this.appStore.user?.role === 'admin') {
      this.$router.push('/logs');
    } else {
      this.$router.push('/history');
    }
  }
  }
}
</script>

