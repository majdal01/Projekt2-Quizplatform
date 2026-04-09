<template>
  <div class="container">
    <h1>Min Historik</h1>

    <p v-if="loading" class="loading">Henter resultater...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="results.length">
      <thead>
        <tr>
          <th>Quiz</th>
          <th>Start</th>
          <th>Slut</th>
          <th>Total Tid</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in results" :key="item.id">
          <td>{{ item.quizTitle }}</td>
          <td>{{ formatDate(item.startTime) }}</td>
          <td>{{ formatDate(item.endTime) }}</td>
          <td>{{ calculateDuration(item.startTime, item.endTime) }}</td>
          <td>{{ item.score }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!loading">Ingen resultater fundet.</p>

    <button class="btn-primary" @click="$router.push('/dashboard')">Tilbage</button>
  </div>
</template>

<script>
import { appStore } from '../stores/appStore'

export default {
  name: 'HistoryView',
  data() {
    return {
      results: [],
      loading: false,
      error: ''
    }
  },
  mounted() {
    this.fetchResults()
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('da-DK')
    },
    calculateDuration(start, end) {
    if (!start || !end) return '-'

    const startTime = new Date(start)
    const endTime = new Date(end)
    
    // Forskellen i millisekunder
    const diffMs = endTime - startTime

    if (diffMs < 0) return 'Ugyldig tid'
    const totalSeconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  },
    async fetchResults() {
      this.loading = true
      this.error = ''

      try {
        const response = await fetch('http://localhost:3000/quiz/history', {
          credentials: 'include', 
          headers: {
            Authorization: `Bearer ${appStore.token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
             throw new Error('Du er ikke logget ind eller din session er udløbet');
          }
          throw new Error('Kunne ikke hente resultater');
        }

        const data = await response.json()
        
        this.results = data;
        
      } catch (error) {
        this.error = error.message || 'Fejl ved hentning af resultater'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
