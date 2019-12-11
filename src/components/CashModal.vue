<template>
  <b-modal
    v-model="open"
    size="lg"
    :centered="true"
    :hide-header="true"
    :hide-footer="true"
    :no-close-on-backdrop="true"
    dialog-class="credit_modal"
    :body-class="['credit_modal']"
  >
    <div class="inner">
      <h3>현금결제</h3>
      <div class="img">
        <img src="@/assets/img/coin.gif" />
      </div>
      <p>
        결제금액만큼 현금을 투입해주세요
      </p>
      <div class="info">
        <dl>
          <dt>결제금액</dt>
          <dd>
            <b>{{ total | numeral('0,0') }}</b> 원
          </dd>
        </dl>
        <dl>
          <dt>투입된 금액</dt>
          <dd>
            <b>{{ amount | numeral('0,0') }}</b> 원
          </dd>
        </dl>
      </div>
    </div>
  </b-modal>
</template>

<script>
import API from '@/mixin/device';

export default {
  name: 'cash-modal',
  mixins: [API],
  data() {
    return {
      open: false,
      total: 0,
      amount: 0,
      sub: {
        input: {},
        submit: {},
        error: {},
      },
    };
  },
  mounted() {
    const self = this;
    this.sub.input = this.inputCashObserver().subscribe(
      input => {
        self.amount += input;
      },
      () => {},
    );
  },
  methods: {
    async show(amount, products) {
      try {
        this.total = amount;
        this.open = true;
        const resultData = await this.payment('cash', products);
        const [, lessData] = resultData.split('&');
        const less = Number(lessData.slice(1, lessData.length));
        this.$emit('submit', { type: 'cash', less });
      } catch (error) {
        this.$emit('error', error);
      }
    },
  },
  beforeDestroy() {
    this.sub.input.unsubscribe();
  },
};
</script>
