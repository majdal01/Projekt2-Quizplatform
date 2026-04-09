<template>
  <div class="container">
    <h1>Resultat</h1>

    <div v-if="result">
      <p><strong>Score:</strong> {{ result.score }}</p>
      <p><strong>Korrekte svar:</strong> {{ result.correctAnswers }}</p>
      <p><strong>Antal spørgsmål:</strong> {{ result.totalQuestions }}</p>
    </div>

    <p v-else class="error">Ingen resultater fundet.</p>

    <div class="menu">
      <button class="btn-secondary" @click="$router.push('/dashboard')">Til dashboard</button>
    </div>
  </div>
</template>

<script>
import { appStore } from '../stores/appStore'

export default {
  name: 'ResultsView',
  computed: {
    result() {
      return appStore.lastResult
    }
  }
}
</script>
