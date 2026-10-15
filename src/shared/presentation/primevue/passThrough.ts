/**
 * Pass-through PrimeVue (mode unstyled) : les composants génériques reçoivent
 * nos propres classes, stylées en SCSS avec les tokens du produit.
 */
import type { PrimeVuePTOptions } from 'primevue/config'

interface ButtonPtContext {
  props: { severity?: string | null; text?: boolean; outlined?: boolean; size?: string; label?: string | null }
}

export const passThrough: PrimeVuePTOptions = {
  button: {
    root: ({ props }: ButtonPtContext) => ({
      class: [
        'ui-button',
        `ui-button--${props.severity ?? 'primary'}`,
        {
          'ui-button--text': props.text,
          'ui-button--outlined': props.outlined,
          'ui-button--small': props.size === 'small',
          'ui-button--icon-only': !props.label,
        },
      ],
    }),
    label: { class: 'ui-button__label' },
    icon: { class: 'ui-button__icon' },
    loadingIcon: { class: 'ui-button__icon ui-button__icon--loading' },
  },
  inputtext: { root: { class: 'ui-input' } },
  textarea: { root: { class: 'ui-input ui-textarea' } },
  radiobutton: {
    root: { class: 'ui-radio' },
    input: { class: 'ui-radio__input' },
    box: { class: 'ui-radio__box' },
    icon: { class: 'ui-radio__icon' },
  },
  message: {
    root: ({ props }: { props: { severity?: string } }) => ({ class: ['ui-message', `ui-message--${props.severity ?? 'info'}`] }),
    content: { class: 'ui-message__content' },
    text: { class: 'ui-message__text' },
    icon: { class: 'ui-message__icon' },
  },
  dialog: {
    mask: { class: 'ui-dialog-mask' },
    root: { class: 'ui-dialog' },
    header: { class: 'ui-dialog__header' },
    title: { class: 'ui-dialog__title' },
    headerActions: { class: 'ui-dialog__actions' },
    content: { class: 'ui-dialog__content' },
    footer: { class: 'ui-dialog__footer' },
  },
  confirmdialog: {
    mask: { class: 'ui-dialog-mask' },
    root: { class: 'ui-dialog' },
    header: { class: 'ui-dialog__header' },
    title: { class: 'ui-dialog__title' },
    headerActions: { class: 'ui-dialog__actions' },
    content: { class: 'ui-dialog__content' },
    icon: { class: 'ui-dialog__icon' },
    message: { class: 'ui-dialog__message' },
    footer: { class: 'ui-dialog__footer' },
  },
  toast: {
    root: { class: 'ui-toast' },
    message: { class: 'ui-toast__message' },
    messageContent: { class: 'ui-toast__content' },
    messageIcon: { class: 'ui-toast__icon' },
    messageText: { class: 'ui-toast__text' },
    summary: { class: 'ui-toast__summary' },
    detail: { class: 'ui-toast__detail' },
    buttonContainer: { class: 'ui-toast__actions' },
    closeButton: { class: 'ui-toast__close' },
  },
}
