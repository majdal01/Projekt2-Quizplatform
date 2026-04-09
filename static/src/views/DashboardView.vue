<template>
  <div class="container">
    <h1>Dashboard</h1>

    <p>Logget ind som: {{ appStore.user?.username }}</p>
    <p>Rolle: {{ appStore.user?.role }}</p>

    <div class="dashboard-actions">
      <template v-if="appStore.user?.role === 'admin'">
        <button @click="$router.push('/admin/upload')">Upload quiz</button>
        <button @click="$router.push('/admin/delete')">Slet quiz</button>
        <button @click="$router.push('/history')">Se log</button>
        <button @click="$router.push('/quiz')">Tag quiz</button>
      </template>

      <template v-else>
        <button @click="$router.push('/quiz')">Tag test</button>
        <button @click="$router.push('/history')">Se mine resultater</button>
      </template>

      <button class="secondary-btn" @click="handleLogout">Log ud</button>
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
    }
  }
}
</script>
