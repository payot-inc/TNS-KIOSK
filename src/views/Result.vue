<template>
  <div id="contents">
    <div class="sub complete">
      <div class="complete_title">
        <span class="icon"
          ><p><img src="@/assets/img/auto.png" /></p
        ></span>
        <span class="title">결제가 완료되었습니다</span>
        <span class="des"
          >선택하신 자판기에서 구매하신<br />
          상품을 찾아가주세요</span
        >
      </div>
      <div class="inner">
        <div class="order_list">
          <ul>
            <li v-for="p in products" :key="p.id">
              <span class="eq">{{ p.machineId | numeral('0,0') }} 자판기</span>
              <span class="name">{{ p.name }}</span>
              <span class="amount"></span>
              <span class="price">{{ p.price | numeral('0,0') }}원</span>
            </li>
          </ul>
        </div>
        <div class="credit_info">
          <dl>
            <dt>결제방법</dt>
            <dd>현금</dd>
          </dl>
          <dl>
            <dt>결제금액</dt>
            <dd>
              <b>
                {{ this.products.reduce((acc, { price }) => acc + Number(price), 0) | numeral('0,0') }}
              </b>원
            </dd>
          </dl>
        </div>

        <div class="bottom_btns">
          <router-link to="/">
            처음으로 돌아가기
            <i class="material-icons">keyboard_arrow_right</i>
          </router-link>
          <p>
            <b id="count">{{ timer }}</b
            >초 후 메인페이지로 돌아갑니다.
          </p>
        </div>
      </div>
      <!-- inner -->
    </div>
    <!-- conplete -->
  </div>
</template>

<script>
import { zip, interval, range } from 'rxjs';
import { skip, tap, take, delay, map, startWith, takeLast } from 'rxjs/operators';

export default {
  props: ['products'],
  data() {
    return {
      timeOut: 10,
    };
  },
  subscriptions() {
    let counter = this.timeOut;
    const timer = zip(interval(1000), range(1, counter)).pipe(
      map(([, c]) => counter - c),
      startWith(counter),
    );
    return {
      timer,
      wrapPage: timer.pipe(
        takeLast(1),
        tap(() => this.$router.push('/')),
      ),
    };
  },
};
</script>