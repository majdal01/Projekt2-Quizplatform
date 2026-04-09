<template>
  <div class="container">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>Logget ind som: {{ appStore.user?.username }}</p>
        <p>Rolle: {{ appStore.user?.role }}</p>
      </div>

      <input 
        type="file" 
        ref="fileInput" 
        accept=".json" 
        style="display: none" 
        @change="handleFileUpload" 
      />
      
      <button
        v-if="appStore.user?.role === 'admin'"
        class="btn-primary"
        @click="$refs.fileInput.click()"
      >
        Upload quiz (.json)
      </button>
    </div>

    <div class="card-grid">
      <div v-for="quiz in quizzes" :key="quiz.id" class="card quiz-card">
        <div>
          <h3>{{ quiz.title || quiz.name }}</h3>
          <p>{{ quiz?.description || ""}}</p>
          <p>Antal spørgsmål: {{ quiz.questionCount }}</p>
        </div>

        <div class="quiz-card-actions">
          <button class="btn-success" @click="$router.push(`/quiz/${quiz.id}`)">
            Tag quiz
          </button>

          <button
            v-if="appStore.user?.role === 'admin'"
            class="btn-warning"
            @click="deleteQuiz(quiz.id)"
          >
            Slet quiz
          </button>
        </div>
      </div>
      
      <div v-if="quizzes.length === 0" class="no-quizzes">
        <p>Ingen quizzer tilgængelige i øjeblikket.</p>
      </div>
    </div>

    <div class="dashboard-actions">
      <button class="btn-info" @click="goToResults">
        {{ appStore.user?.role === 'admin' ? 'Se log' : 'Mine Resultater' }}
      </button>

      <button class="logout-btn" @click="handleLogout">
        Log ud
      </button>
    </div>
  </div>
</template>

<script>
import { appStore } from '../stores/appStore'

export default {
  name: 'DashboardView',
  data() {
    return {
      appStore,
      quizzes: []
    }
  },
  mounted() {
    // Henter quizzer så snart komponenten er loaded
    this.fetchQuizzes()
  },
  methods: {
    // Henter alle quizzer
    async fetchQuizzes() {
      try {
        const response = await fetch('http://localhost:3000/quiz', {
         credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${appStore.token}`
          }
        });
        
        if (response.ok) {
          this.quizzes = await response.json();
          console.log(this.quizzes);
          
        } else {
          console.error("Kunne ikke hente quizzer");
        }
      } catch (error) {
        console.error("Fejl ved API kald:", error);
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonPayload = JSON.parse(e.target.result);

          const response = await fetch('http://localhost:3000/admin/upload', {
            credentials: 'include',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${appStore.token}`
            },
            body: JSON.stringify(jsonPayload)
          });

          if (response.ok) {
            alert('Quizzen blev uploadet succesfuldt!');
            this.fetchQuizzes(); 
          } else {
            const errorData = await response.json();
            alert(`Fejl: ${errorData.error || 'Kunne ikke uploade quiz'}`);
          }
        } catch (error) {
          alert('Fejl: Filen er ikke valid JSON');
        } finally {
          this.$refs.fileInput.value = '';
        }
      };

      reader.readAsText(file);
    },

    async deleteQuiz(id) {
      if (!confirm('Er du sikker på, at du vil slette denne quiz?')) return;

      try {
        const response = await fetch(`http://localhost:3000/admin/delete/${id}`, {
          credentials: 'include',
          method: 'DELETE',
          headers: {
             Authorization: `Bearer ${appStore.token}`
          }
        });

        if (response.ok) {
          this.quizzes = this.quizzes.filter(quiz => quiz.id !== id);
          alert('Quiz slettet');
        } else {
          const errorData = await response.json();
          alert(`Fejl: ${errorData.error || 'Kunne ikke slette quiz'}`);
        }
      } catch (error) {
        console.error("Fejl ved sletning:", error);
      }
    },

    handleLogout() {
      appStore.logout()
      this.$router.push('/login')
    },
    
    goToResults() {
      if (this.appStore.user?.role === 'admin') {
        this.$router.push('/logs');
      } else {
        this.$router.push('/history');
      }
    }
  }
}
</script>