<template>
  <div>
    <nav v-if="appStore.isLoggedIn()" class="top-nav">
      <template v-if="appStore.isAdmin()">
        <button @click="$router.push('/admin')">Upload quiz</button>
        <button @click="$router.push('/admin')">Slet quiz</button>
        <button @click="$router.push('/admin')">Se log</button>
        <button @click="$router.push('/quiz')">Tag quiz</button>
      </template>

      <template v-else>
        <button @click="$router.push('/quiz')">Tag test</button>
        <button @click="$router.push('/history')">Se mine resultater</button>
      </template>

      <button class="logout-btn" @click="handleLogout">Log ud</button>
    </nav>

    <router-view />
  </div>
</template>

<script>
import { appStore } from './stores/appStore'

export default {
  name: 'App',
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
