<template>
  <div class="container">
    <h1>Quiz</h1>

    <p v-if="loading" class="loading">Henter spørgsmål...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="question">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressWidth }"></div>
      </div>

      <p><strong>Spørgsmål {{ currentIndex + 1 }}</strong></p>
      <p>{{ question.text }}</p>

      <form @submit.prevent="submitAnswer">
        <label v-for="option in question.options" :key="option" class="option">
          <input v-model="selectedAnswer" type="radio" :value="option" name="answer" required />
          {{ option }}
        </label>

        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Sender...' : 'Send svar' }}
        </button>
      </form>

      <p v-if="feedback" class="success">{{ feedback }}</p>
    </div>
  </div>
</template>

<script>
import { appStore } from '../stores/appStore'

export default {
  name: 'QuizView',
  data() {
    return {
      quizId: 1,
      question: null,
      currentIndex: 0,
      totalQuestions: 1,
      selectedAnswer: '',
      loading: false,
      submitting: false,
      error: '',
      feedback: ''
    }
  },
  computed: {
    progressWidth() {
      return `${((this.currentIndex + 1) / this.totalQuestions) * 100}%`
    }
  },
  mounted() {
    this.startQuiz()
  },
  methods: {
    async startQuiz() {
      this.loading = true
      this.error = ''

      try {
        const response = await fetch(`/quiz/${this.quizId}/start`, {
          headers: {
            Authorization: `Bearer ${appStore.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Kunne ikke hente quiz')
        }

        const data = await response.json()
        this.question = data.question
        this.currentIndex = data.currentIndex || 0
        this.totalQuestions = data.totalQuestions || 1
      } catch (error) {
        this.error = 'Kunne ikke hente første spørgsmål'
      } finally {
        this.loading = false
      }
    },

    async submitAnswer() {
      this.submitting = true
      this.error = ''
      this.feedback = ''

      try {
        const response = await fetch(`/quiz/${this.quizId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appStore.token}`
          },
          body: JSON.stringify({
            answer: this.selectedAnswer
          })
        })

        if (!response.ok) {
          throw new Error('Kunne ikke sende svar')
        }

        const data = await response.json()
        this.feedback = data.feedback || 'Svar sendt'

        if (data.finished) {
          appStore.setLastResult(data.result)
          this.$router.push('/results')
          return
        }

        this.question = data.question
        this.currentIndex = data.currentIndex
        this.totalQuestions = data.totalQuestions
        this.selectedAnswer = ''
      } catch (error) {
        this.error = 'Der opstod en fejl ved indsendelse af svar'
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
