<template>
  <b-modal
    v-model="open"
    size="lg"
    :centered="true"
    :hide-header="true"
    :hide-footer="true"
    dialog-class="credit_modal"
    :body-class="['credit_modal']"
  >
    <div class="inner">
      <h3>모바일 결제</h3>
      <div class="img">
        <!-- <img src="@/assets/img/coin.gif" /> -->
        <qrcode :value="qrcode" :options="{ width: 500 }" />
      </div>
      <p>
        화면에 표시된 QR코드를 스캔해 주세요
      </p>
      <div class="info">
        <dl>
          <dt>결제 예정금액</dt>
          <dd>
            <b>{{ total | numeral('0,0') }}</b> 원
          </dd>
        </dl>
      </div>
    </div>
  </b-modal>
</template>

<script>
import API from '@/mixin/device';
import { take, timeout } from 'rxjs/operators';

export default {
  name: 'mobile-modal',
  mixins: [API],
  data() {
    return {
      open: false,
      qrcode: '',
      total: 0,
      observer: null,
      sub: {
        input: {},
        submit: {},
        error: {},
      },
    };
  },
  // watch: {
  //   open(newValue) {
  //     if (newValue) return;
  //     this.observer.unsubscribe();
  //   },
  // },
  methods: {
    async show(amount, products) {
      try {
        this.total = amount;
        this.qrcode = JSON.stringify({
          type: 'kiosk',
          amount,
        });
        this.open = true;
        await this.$socket.response.pipe(take(1), timeout(60 * 1000)).toPromise();
        await this.payment('card', products);

        this.$emit('submit', { type: 'mobile', less: 0 });
      } catch (error) {
        this.$emit('error', error);
      }
    },
  },
};
</script>
