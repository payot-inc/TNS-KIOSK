<template>
  <div id="app">
    <router-view />
    <div id="status-bar">
      <div class="time">
        {{ time | moment('HH:mm') }}
      </div>
    </div>
  </div>
</template>

<script>
import { interval } from 'rxjs';
import API from './mixin/device';
import { of, map, filter, delay, startWith } from 'rxjs/operators';

export default {
  mixins: [API],
  mounted() {
    const self = this;
    setTimeout(() => {
      self.stockList();
    }, 2000);
    // const self = this;
    // 오류 핸들러
    // of(null).pipe(
    //   delay(2000),
    //   this.$serial.response,
    //   filter(({ commend }) => commend === 'error'),
    //   map(data => {
    //     return data
    //       .split('&')
    //       .map(str => str.slice(1, str.length))
    //       .map(id => ({ id, isBroken: true }));
    //   }),
    // ).subscribe(params => {
    //   // self.$axios.put('/');
    // });

    // // 오류 수정 핸들러
    // this.$serial.response
    //   .pipe(
    //     filter(({ commend }) => commend === 'resume'),
    //     map(data => {
    //       return data
    //         .split('&')
    //         .map(str => str.slice(1, str.length))
    //         .map(id => ({ id, isBroken: false }));
    //     }),
    //   )
    //   .subscribe(params => {}, console.log);
  },
  subscriptions() {
    // 장치 오류 수신 메시지
    const machineBrokenErrorRegex = /^\[q [E-F]{1} (Q[\d]{3}&{0,1}){0,}\]$/;

    return {
      time: interval(1000).pipe(
        startWith(() => new Date()),
        map(() => new Date()),
      ),
    };
  },
};
</script>
