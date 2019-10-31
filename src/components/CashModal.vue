<template>
  <!-- <div
    class="modal fade credit_modal show"
    id="coin_modal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-modal="true"
    style="display: block;"
  > -->
  <b-modal v-model="open" class="credit_modal" :centered="true" size="xl">
    <div class="modal-dialog modal-lg">
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
              <b>{{ payAmount || 0 | numeral('0,0') }}</b> 원
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import numeral from 'numeral';

export default {
  name: 'cash-modal',
  data() {
    return {
      open: false,
      total: 0,
    };
  },
  methods: {
    show(amount, products) {
      const commendProductParams = products
        .map(({ machineId, id, price }) => {
          const productId = id.substring(3, id.length);
          return `Q${machineId}/R${productId}/S${numeral(Number(price) / 100).format('000')}`;
        })
        .join('&');
      const commend = `[q B U${numeral(amount).format('000000')}&${commendProductParams}]\r\n`;
      this.$serial.write(commend);
      this.total = amount;
      this.open = true;
    },
  },
  subscriptions() {
    return {
      payAmount: this.$serial.response.pipe(
        tap(console.log),
      ),
    };
  },
};
</script>