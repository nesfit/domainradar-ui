import { defineStore } from 'pinia'

interface Preferences {
  theme: 'system' | 'light' | 'dark'
  allowHolo: boolean
}

export const usePreferencesStore = defineStore('preferences', {
  state: (): Preferences => ({
    theme: 'system',
    allowHolo: true
  }),
  
  actions: {
    setTheme(theme: 'system' | 'light' | 'dark') {
      this.theme = theme
    },
    setAllowHolo(allow: boolean) {
      this.allowHolo = allow
    },
    loadFromStorage() {
      const stored = localStorage.getItem('preferences')
      if (stored) {
        const prefs = JSON.parse(stored)
        this.theme = prefs.theme
        this.allowHolo = prefs.allowHolo
      }
    }
  }
})

// Plugin to save preferences to localStorage whenever they change
export function preferencesPlugin({ store }: { store: any }) {
  store.$subscribe((mutation: any, state: any) => {
    localStorage.setItem('preferences', JSON.stringify({
      theme: state.theme,
      allowHolo: state.allowHolo
    }))
  })
}