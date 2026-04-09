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
  }
}

