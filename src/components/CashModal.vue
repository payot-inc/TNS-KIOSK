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
import { interval } from 'rxjs';
import { filter, map, tap, startWith, sum, reduce } from 'rxjs/operators';
import numeral from 'numeral';

export default {
  name: 'cash-modal',
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
    this.sub.input = this.$serial.response
      .pipe(
        filter(msg => /^\[r B U[\d]{6}\]$/.test(msg)),
        map(result => {
          const data = result
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .split(' ')[2];
          const [, ...amount] = data;
          return Number(amount.join(''));
        }),
      )
      .subscribe(input => {
        this.amount += input;
      });

    this.sub.error = this.$serial.response
      .pipe(
        filter(msg => /^\[r B Y[b-i]\]$/.test(msg)),
        map(msg => msg.substring(6, 7)),
        map(err => {
          switch (err) {
            case 'b':
              return { message: '잔돈이 부족합니다', code: err };
            case 'c':
              return { message: '반환되었습니다', code: err };
            case 'd':
              return { message: '투입시간이 초과되었습니다', code: err };
            default:
              return { message: '오류가 발생하였습니다', code: err, print: true };
          }
        }),
      )
      .subscribe(
        err => {
          this.$emit('error', err);
          this.open = false;
        },
        () => {},
      );

    this.sub.submit = this.$serial.response
      .pipe(
        filter(msg => /^\[r B Ya&V[\d]{6}\]$/.test(msg)),
        map(result => {
          const data = result
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .split(' ')[2];
          const [, ...amount] = data.split('&')[1];
          return Number(amount.join(''));
        }),
      )
      .subscribe(less => {
        this.$emit('submit', { type: 'cash', less });
      });
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
  beforeDestroy() {
    this.sub.input.unsubscribe();
    this.sub.submit.unsubscribe();
  },
};
</script>