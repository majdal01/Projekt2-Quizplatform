<template>
  <div class="container">
    <h1>Registrer bruger</h1>

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

      <p class="auth-note">
        Password skal være mindst 8 tegn og indeholde mindst ét stort bogstav,
        ét lille bogstav, ét tal og ét specialtegn.
      </p>

      <button class="btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Opretter...' : 'Registrer' }}
      </button>
    </form>

    <button class="btn-secondary" @click="$router.push('/login')">
      Gå til login
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

      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

      if (!strongPasswordRegex.test(this.password)) {
        this.error =
          'Password skal være mindst 8 tegn og indeholde stort bogstav, lille bogstav, tal og specialtegn'
        this.loading = false
        return
      }

      try {
        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
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
          throw new Error(data.message || 'Kunne ikke oprette bruger')
        }

        this.success = 'Bruger oprettet. Du kan nu logge ind.'
        this.username = ''
        this.password = ''

        setTimeout(() => {
          this.$router.push('/login')
        }, 1200)
      } catch (error) {
        this.error = error.message || 'Kunne ikke oprette bruger'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

