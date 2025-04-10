import { defineStore } from 'pinia'

interface Preferences {
  theme: 'system' | 'light' | 'dark'
  allowHolo: boolean
}

const defaultPreferences: Preferences = {
  theme: 'system',
  allowHolo: true
}

// Validate a single preference value
function isValidPreference(key: keyof Preferences, value: any): boolean {
  if (value === undefined || value === null) return false
  
  switch (key) {
    case 'theme':
      return ['system', 'light', 'dark'].includes(value)
    case 'allowHolo':
      return typeof value === 'boolean'
    default:
      return false
  }
}

export const usePreferencesStore = defineStore('preferences', {
  state: (): Preferences => ({ ...defaultPreferences }),
  
  actions: {
    setTheme(theme: 'system' | 'light' | 'dark') {
      this.theme = theme
    },
    setAllowHolo(allow: boolean) {
      this.allowHolo = allow
    },
    loadFromStorage() {
      try {
        const stored = localStorage.getItem('preferences')
        if (!stored) return

        const prefs = JSON.parse(stored)
        
        if (isValidPreference('theme', prefs.theme)) {
          this.theme = prefs.theme
        }
        if (isValidPreference('allowHolo', prefs.allowHolo)) {
          this.allowHolo = prefs.allowHolo
        }
      } catch (e) {
        console.error('Failed to load preferences:', e)
      }
    }
  }
})

// Plugin to save preferences to localStorage whenever they change
export function preferencesPlugin({ store }: { store: any }) {
  store.$subscribe((mutation: any, state: any) => {
    try {
      // Only persist values that pass validation
      const prefsToSave: Partial<Preferences> = {}
      
      if (isValidPreference('theme', state.theme)) {
        prefsToSave.theme = state.theme
      }
      if (isValidPreference('allowHolo', state.allowHolo)) {
        prefsToSave.allowHolo = state.allowHolo
      }

      // Only save if we have valid values
      if (Object.keys(prefsToSave).length > 0) {
        localStorage.setItem('preferences', JSON.stringify(prefsToSave))
      }
    } catch (e) {
      console.error('Failed to save preferences:', e)
    }
  })
}