import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'
import { appStore } from './stores/appStore.js'

appStore.fetchUser().then(() => {
  createApp(App).use(router).mount('#app')
}).catch(err => {
  console.error("Fejl under opstart:", err);
  createApp(App).use(router).mount('#app') 
});
