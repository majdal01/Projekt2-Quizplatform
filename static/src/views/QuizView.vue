<template>
  <div class="container">
    <h1>{{ quiz?.title || 'Quiz' }}</h1>

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
      quiz: null,
      questions: [],
      currentIndex: 0,
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
    currentQuestion() {
      return this.questions[this.currentIndex] || null
    },
    totalQuestions() {
      return this.questions.length
    },
    progressWidth() {
      if (!this.totalQuestions) return '0%'
      return `${((this.currentIndex + 1) / this.totalQuestions) * 100}%`
    }
  },
  mounted() {
    this.fetchQuiz()
  },
  methods: {
    async fetchQuiz() {
      this.loading = true
      this.error = ''

      try {
        const response = await fetch('http://localhost:3000/quizzes/express', {
          headers: {
            Authorization: `Bearer ${appStore.token}`
          }
        })

        if (!response.ok) {
          throw new Error('Kunne ikke hente quiz')
        }

        const data = await response.json()
        this.quiz = data
        this.questions = data.questions || []
      } catch (error) {
        this.error = 'Kunne ikke hente spørgsmål'
      } finally {
        this.loading = false
      }
    },

    normalizeText(value) {
      return String(value).trim().toLowerCase()
    },

    arraysEqual(a, b) {
      if (a.length !== b.length) return false
      const sortedA = [...a].sort()
      const sortedB = [...b].sort()
      return sortedA.every((value, index) => value === sortedB[index])
    },

    submitAnswer() {
      this.feedback = ''

      if (!this.currentQuestion) return

      let isCorrect = false

      if (this.currentQuestion.type === 'mc-single') {
        isCorrect = this.currentQuestion.correctAnswers.includes(this.selectedSingle)
      }

      if (this.currentQuestion.type === 'mc-multi') {
        isCorrect = this.arraysEqual(
          this.selectedMultiple,
          this.currentQuestion.correctAnswers
        )
      }

      if (this.currentQuestion.type === 'cloze-text') {
        isCorrect = this.currentQuestion.correctAnswers.some(
          answer => this.normalizeText(answer) === this.normalizeText(this.selectedText)
        )
      }

      if (isCorrect) {
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
          quizTitle: this.quiz?.title || 'Quiz'
        }
        this.finished = true
        return
      }

      this.currentIndex++
      this.selectedSingle = null
      this.selectedMultiple = []
      this.selectedText = ''
    }
  }
}
</script>

