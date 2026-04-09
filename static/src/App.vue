<template>
  <div>
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
