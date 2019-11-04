<template>
  <div id="contents">
    <div class="header">
      <!-- <router-link to="/products" class="back"><i class="material-icons">keyboard_backspace</i><router-link> -->
      <!-- <router-link to="/" class="home"><i class="material-icons">home</i></router-link> -->
    </div>
    <div class="sub order">
      <div class="sub_title">
        <h2>주문하기</h2>
        <p>선택하신 상품을 확인 후 결제를 진행 해 주세요</p>
        <span></span>
      </div>
      <div class="inner">
        <div class="order_list">
          <ul>
            <li v-for="p in products" :key="p.id">
              <span class="eq">{{ p.machineId | numeral('00') }} 자판기</span>
              <span class="name">{{ p.name }}</span>
              <span class="amount"></span>
              <span class="price">{{ p.price | numeral('0,0') }}원</span>
            </li>
          </ul>
        </div>
        <div class="last_price">
          <dl>
            <dt>최종결제금액</dt>
            <dd>
              <b>{{
                products.reduce((acc, { price }) => acc + Number(price), 0) | numeral('0,0')
              }}</b>
              원
            </dd>
          </dl>
        </div>
        <div class="credit">
          <p><b>결제방법</b>을 선택해주세요</p>
          <div class="row">
            <div
              class="col-lg-4"
              @click="
                $bvModal.msgBoxOk('지금은 카드결제를 이용하실 수 없습니다', {
                  centered: true,
                  size: 'lg',
                  okTitle: '확인',
                })
              "
            >
              <dl data-toggle="modal" data-target="#card_modal" class="modal-on">
                <dt>
                  <span><img src="@/assets/img/card_img.jpg"/></span>
                </dt>
                <dd>카드결제</dd>
              </dl>
            </div>
            <div class="col-lg-4" @click="pay('cash')">
              <dl>
                <dt>
                  <span><img src="@/assets/img/coin.png"/></span>
                </dt>
                <dd>현금결제</dd>
              </dl>
            </div>
            <div class="col-lg-4" @click="pay('mobile')">
              <dl>
                <dt>
                  <span><img src="@/assets/img/mobile.png"/></span>
                </dt>
                <dd>모바일 결제</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <!-- inner -->
    </div>
    <!-- order -->

    <cash-modal ref="cash" @submit="submit($event)" @error="printError($event)" />
    <mobile-modal ref="mobile" @submit="submit($event)" />
  </div>
</template>

<script>
import CashModal from '@/components/CashModal.vue';
import MobileModal from '@/components/MobileModal.vue';

export default {
  props: ['products'],
  components: {
    CashModal,
    MobileModal,
  },
  computed: {
    totalAmount() {
      return this.products.reduce((acc, { price }) => acc + Number(price), 0);
    },
  },
  methods: {
    pay(method) {
      if (method === 'cash') {
        this.$refs.cash.show(this.totalAmount, this.products);
      } else if (method === 'mobile') {
        this.$refs.mobile.show(this.totalAmount, this.products);
      }
    },

    async submit({ type, less }) {
      try {
        await this.$axios.post('/pay', {
          method: type,
          returnCoin: less,
          products: this.products,
          amount: this.totalAmount,
        });
        this.$router.push({ name: 'result', params: { products: this.products, less } });
      } catch (error) {
        this.$bvModal.msgBoxOk('오류가 발생하였습니다', {
          centered: true,
          size: 'sm',
          okTitle: '확인',
        });
      }
    },

    async printError({ print, message, code }) {
      let msg = '';
      if (print) {
        msg = `오류가 발생하였습니다 [${code}]`;
      } else {
        msg = message;
      }

      await this.$bvModal.msgBoxOk(msg, { centered: true, size: 'sm', okTitle: '확인' });
      this.$router.push({ name: 'home' });
    },
  },
};
</script>