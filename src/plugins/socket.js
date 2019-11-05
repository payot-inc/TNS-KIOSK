import Vue from 'vue';
import { Subject } from 'rxjs';

const response = new Subject();

const socket = new WebSocket('ws://15.164.230.61:3000');
socket.onopen = () => {
  console.log('open socket');
}
socket.onmessage = ({ data }) => {
  const res = JSON.parse(data);
  response.next(res);
}

Vue.prototype.$socket = socket;
Vue.prototype.$socket.response = response;