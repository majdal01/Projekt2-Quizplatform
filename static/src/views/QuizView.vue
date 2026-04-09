<template>
  <div class="container">
    <h1>{{ quizTitle }}</h1>

    <p v-if="loading" class="loading">Henter spørgsmål...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="currentQuestion && !finished">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressWidth }"></div>
      </div>

      <p><strong>Aktuel score:</strong> {{ score }} / {{ totalQuestions }}</p>
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
              :disabled="hasAnswered"
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
              :disabled="hasAnswered"
            />
            {{ option }}
          </label>
        </template>

        <template v-else-if="currentQuestion.type === 'cloze-text'">
          <input
            v-model="selectedText"
            type="text"
            placeholder="Skriv dit svar"
            :disabled="hasAnswered"
            required
          />
        </template>

        <button class="btn-primary" type="submit" v-if="!hasAnswered">
          Svar
        </button>
      </form>

      <div v-if="hasAnswered" class="feedback-section">
        <p :class="isCorrect ? 'success' : 'error'">{{ feedback }}</p>
        <button class="btn-primary" @click="goToNext">
          {{ isLastQuestion ? 'Afslut quiz' : 'Gå til næste spørgsmål' }}
        </button>
      </div>
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
      selectedText: '',
      hasAnswered: false,
      isCorrect: false,
      isLastQuestion: false,
      pendingNextQuestion: null,
      pendingIndex: 0
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
            'Content-Type': 'application/json'
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
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ answer })
        })

        if (!response.ok) {
          throw new Error('Kunne ikke sende svar')
        }

        const data = await response.json()

        this.score = data.score
        this.isCorrect = data.isCorrect
        this.feedback = data.isCorrect ? 'Korrekt svar!' : 'Desværre, det var forkert.'
        this.hasAnswered = true

        if (data.message === 'Quiz færdig' || data.finished) {
          this.isLastQuestion = true
        } else {
          this.isLastQuestion = false
          this.pendingNextQuestion = data.nextQuestion
          this.pendingIndex = data.currentIndex
        }
      } catch (error) {
        this.error = 'Der skete en fejl ved svar'
      }
    },

    goToNext() {
      if (this.isLastQuestion) {
        appStore.lastResult = {
          score: this.score,
          totalQuestions: this.totalQuestions,
          quizTitle: this.quizTitle,
          correctAnswers: this.score
        }
        this.finished = true
      } else {
        this.currentIndex = this.pendingIndex
        this.currentQuestion = this.pendingNextQuestion
        this.hasAnswered = false
        this.feedback = ''
        this.selectedSingle = null
        this.selectedMultiple = []
        this.selectedText = ''
      }
    }
  }
}
</script>
