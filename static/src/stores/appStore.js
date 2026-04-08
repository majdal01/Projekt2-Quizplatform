export const appStore = {
  token: '',
  user: null,
  lastResult: null,

  login(token, user) {
    this.token = token
    this.user = user
  },

  logout() {
    this.token = ''
    this.user = null
    this.lastResult = null
  },

  setLastResult(result) {
    this.lastResult = result
  },

  isLoggedIn() {
    return !!this.token
  },

  isAdmin() {
    return this.user && this.user.role === 'admin'
  }
}
