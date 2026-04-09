export const appStore = {
  user: null,
  lastResult: null,

  login(user) {
    this.user = user
  },

  logout() {
    this.user = null
    this.lastResult = null
  },

  setLastResult(result) {
    this.lastResult = result
  },

  isLoggedIn() {
    return !!this.user
  },

  isAdmin() {
    return this.user && this.user.role === 'admin'
  }, 

async fetchUser() {
    try {
      const response = await fetch('http://localhost:3000/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        // Alt er godt, brugeren er logget ind
        const userData = await response.json();
        this.user = userData;
      } else if (response.status === 401) {
        this.user = null;
      } else {
        console.warn("Uventet svar fra backend ved session-tjek:", response.status);
      }
    } catch (error) {
      // Fanger netværksfejl (hvis din Express-server slet ikke kører)
      console.error("Kunne ikke få forbindelse til backend:", error);
    }
  }
}