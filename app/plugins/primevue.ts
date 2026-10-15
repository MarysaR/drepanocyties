/**
 * Installe PrimeVue en mode unstyled : l'apparence provient entièrement
 * de nos tokens et de nos styles SCSS.
 */
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { frenchLocale } from '@shared/presentation/primevue/frenchLocale'
import { passThrough } from '@shared/presentation/primevue/passThrough'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { unstyled: true, pt: passThrough, locale: frenchLocale })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)
})
