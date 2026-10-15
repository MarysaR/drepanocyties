/**
 * Enregistre le service worker minimal (sans cache) en production,
 * condition de l'installation de l'application sur Android.
 */
import { catchError } from '@shared/errors/catchError'

export default defineNuxtPlugin(() => {
  if (import.meta.dev || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    void catchError(() => navigator.serviceWorker.register('/sw.js', { scope: '/' }), {
      onError: error => console.warn('PWA : enregistrement du service worker impossible', error.code),
    })
  })
})
