<template>
  <div class="container">
    <h1>Registrering</h1>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
    <p v-if="loading" class="loading">Opretter bruger...</p>

    <form @submit.prevent="handleRegister">
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
        {{ loading ? 'Registrerer...' : 'Registrér' }}
      </button>
    </form>

    <button class="secondary-btn" @click="$router.push('/login')">
      Tilbage til login
    </button>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: '',
      success: ''
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true
      this.error = ''
      this.success = ''

      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message || 'Registrering fejlede')
        }

        this.success = 'Brugeren er oprettet. Du kan nu logge ind.'
        this.username = ''
        this.password = ''
      } catch (error) {
        this.error = error.message || 'Kunne ikke registrere bruger'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
