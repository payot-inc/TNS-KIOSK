import Vue from 'vue';
import VueNumeral from 'vue-numeral-filter';
import VueMoment from 'vue-moment';
import moment from 'moment';

moment.locale('ko');

Vue.use(VueNumeral);
Vue.use(VueMoment, { moment });
