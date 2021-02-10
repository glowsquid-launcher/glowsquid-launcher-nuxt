import Vue from 'vue'
import VuetifyToast from 'vuetify-toast-snackbar'

export default ({ $vuetify }, inject) => {
  Vue.use(VuetifyToast, {
    timeout: 3000,
    queuable: true,
    color: 'secondary',
    dismissable: true,
    showClose: true,
    closeIcon: 'mdi-close',
    $vuetify,
    y: 'top'
  })
  inject('toast', Vue.prototype.$toast)
}
