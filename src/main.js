import Vue from 'vue';
import './plugins/axios';
import './plugins/serial';
import './plugins/filters';
import './plugins/bootstrap-vue';
import './plugins/qrcode';
import App from './App.vue';
import router from './router';
import store from './store';
import VueRx from 'vue-rx';

Vue.use(VueRx);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
