<template>
  <div id="app">
    <router-view />
    <div id="status-bar">
      <div class="time">
        {{ time | moment('HH:mm')}}
      </div>
    </div>
  </div>
</template>

<script>
import { interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export default {
  subscriptions() {
    return {
      time: interval(1000).pipe(startWith(() => new Date()), map(() => new Date())),
    };
  },
};
</script>