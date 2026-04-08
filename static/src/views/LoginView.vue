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

      <button type="submit" :disabled="loading">
        {{ loading ? 'Logger ind...' : 'Log ind' }}
      </button>
    </form>

    <p class="auth-links">
      Test-login bruger: <strong>test</strong> / <strong>1234</strong>
    </p>
    <p class="auth-links">
      Test-login admin: <strong>admin</strong> / <strong>1234</strong>
    </p>

    <button class="secondary-btn" @click="$router.push('/register')">
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
        let fakeUser = null

        if (this.username === 'admin' && this.password === '1234') {
          fakeUser = {
            username: 'admin',
            role: 'admin'
          }
        } else if (this.username === 'test' && this.password === '1234') {
          fakeUser = {
            username: 'test',
            role: 'user'
          }
        } else {
          throw new Error('Forkert brugernavn eller adgangskode')
        }

        const fakeToken = 'test-token-123'

        appStore.login(fakeToken, fakeUser)
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
