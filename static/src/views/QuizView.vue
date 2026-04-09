<template>
  <div class="container">
    <h1>{{ quizTitle }}</h1>

    <p v-if="loading" class="loading">Henter spørgsmål...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="currentQuestion && !finished">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressWidth }"></div>
      </div>

      <p><strong>Spørgsmål {{ currentIndex + 1 }} / {{ totalQuestions }}</strong></p>
      <p>{{ currentQuestion.question }}</p>

      <form @submit.prevent="submitAnswer">
        <template v-if="currentQuestion.type === 'mc-single'">
          <label
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="option"
          >
            <input
              v-model="selectedSingle"
              type="radio"
              :value="index"
              name="answer"
              required
            />
            {{ option }}
          </label>
        </template>

        <template v-else-if="currentQuestion.type === 'mc-multi'">
          <label
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="option"
          >
            <input
              v-model="selectedMultiple"
              type="checkbox"
              :value="index"
            />
            {{ option }}
          </label>
        </template>

        <template v-else-if="currentQuestion.type === 'cloze-text'">
          <input
            v-model="selectedText"
            type="text"
            placeholder="Skriv dit svar"
            required
          />
        </template>

        <button type="submit">
          {{ currentIndex === totalQuestions - 1 ? 'Afslut quiz' : 'Næste spørgsmål' }}
        </button>
      </form>

      <p v-if="feedback" class="success">{{ feedback }}</p>
    </div>

    <div v-if="finished" class="card">
      <h2>Quiz færdig</h2>
      <p>Din score: {{ score }} / {{ totalQuestions }}</p>
      <button class="btn-info" @click="$router.push('/results')">Se resultat</button>
      <button class="btn-secondary" @click="$router.push('/dashboard')">Tilbage til dashboard</button>
    </div>
  </div>
</template>

<script>
import { appStore } from '../stores/appStore'

export default {
  name: 'QuizView',
  data() {
    return {
      quizId: 'express',
      quizTitle: 'Quiz',
      currentQuestion: null,
      currentIndex: 0,
      totalQuestions: 0,
      score: 0,
      loading: false,
      error: '',
      feedback: '',
      finished: false,
      selectedSingle: null,
      selectedMultiple: [],
      selectedText: ''
    }
  },
  computed: {
    progressWidth() {
      if (!this.totalQuestions) return '0%'
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
        const response = await fetch(`http://localhost:3000/quiz/${this.quizId}/start`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appStore.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Kunne ikke starte quiz')
        }

        const data = await response.json()
        this.currentQuestion = data.question
        this.totalQuestions = data.totalQuestions
      } catch (error) {
        this.error = 'Kunne ikke hente spørgsmål'
      } finally {
        this.loading = false
      }
    },

    async submitAnswer() {
      this.feedback = ''
      this.error = ''

      let answer = null

      if (this.currentQuestion.type === 'mc-single') {
        answer = this.selectedSingle
      }

      if (this.currentQuestion.type === 'mc-multi') {
        answer = this.selectedMultiple
      }

      if (this.currentQuestion.type === 'cloze-text') {
        answer = this.selectedText
      }

      try {
        const response = await fetch(`http://localhost:3000/quiz/${this.quizId}/answer`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appStore.token}`
          },
          body: JSON.stringify({ answer })
        })

        if (!response.ok) {
          throw new Error('Kunne ikke sende svar')
        }

        const data = await response.json()

        if (data.isCorrect) {
          this.score++
          this.feedback = 'Korrekt svar'
        } else {
          this.feedback = 'Forkert svar'
        }

        const isLastQuestion = this.currentIndex === this.totalQuestions - 1

        if (isLastQuestion) {
          appStore.lastResult = {
            score: this.score,
            totalQuestions: this.totalQuestions,
            quizTitle: this.quizTitle
          }
          this.finished = true
          return
        }

        this.currentIndex++
        this.selectedSingle = null
        this.selectedMultiple = []
        this.selectedText = ''

        this.currentQuestion = null
        this.feedback = ''

        const nextResponse = await fetch(`http://localhost:3000/quiz/${this.quizId}/start`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appStore.token}`
          }
        })

        if (!nextResponse.ok) {
          throw new Error('Kunne ikke hente næste spørgsmål')
        }

        const nextData = await nextResponse.json()
        this.currentQuestion = nextData.question
      } catch (error) {
        this.error = 'Der skete en fejl ved svar'
      }
    }
  }
}
</script>

