<template>
  <div class="container">
    <h1>Log ind</h1>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="loading">Logger ind...</p>

    <form @submit.prevent="handleLogin">
      <input
        v-model="username"
        type="text"
        placeholder="Brugernavn"
        required
        oninvalid="this.setCustomValidity('Udfyld venligst dette felt')"
        oninput="this.setCustomValidity('')"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Adgangskode"
        required
        oninvalid="this.setCustomValidity('Udfyld venligst dette felt')"
        oninput="this.setCustomValidity('')"
      />

      <button class="btn-primary" type="submit" :disabled="loading">
  {{ loading ? 'Logger ind...' : 'Log ind' }}
    </button>
    </form>

    <button class="btn-secondary" type="button" @click="$router.push('/register')">
  Gå til registrering
</button>
  </div>
</template>

<script>
import { appStore } from '../stores/appStore'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''

      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Kunne ikke logge ind')
        }

        appStore.login(data.user)
        this.$router.push('/dashboard')
      } catch (error) {
        this.error = error.message || 'Kunne ikke logge ind'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

