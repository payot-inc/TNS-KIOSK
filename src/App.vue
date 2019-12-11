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
import { map, filter, startWith } from 'rxjs/operators';

export default {
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
