<template>
  <div class="basket">
    <div class="inner">
      <div class="basket_list">
        <ul>
          <li v-for="p in products" :key="p.id">
            <div class="name">
              <span>{{ p.machineId | numeral('00') }} 자판기</span>
              {{ p.name }}
            </div>
            <div class="amount">
              <!-- <span>
                <a>+</a>
                <input type="text" value="0" />
                <a>-</a>
              </span> -->
            </div>
            <div class="price">{{ p.price | numeral('0,0') }}원</div>
            <div class="close" @click="remove(p)">
              <a href="#"><i class="material-icons">close</i></a>
            </div>
          </li>

          <li class="no-data" v-show="products.length === 0">
            <div>상품을 선택 해 주세요</div>
          </li>
        </ul>
        <div class="last">
          <span>최종결제금액</span>
          <strong>{{ totalAmount | numeral('0,0') }} 원</strong>
        </div>
      </div>
      <div class="basket_btns">
        <a href="#" class="cancle" @click="remove(products)">모두취소</a>
        <a href="#" class="order" @click="$emit('submit')">결제하기</a>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'bucket',
  props: ['products'],
  computed: {
    totalAmount() {
      return this.products.reduce((acc, { price }) => acc + Number(price), 0);
    },
  },
  methods: {
    add(product) {
      this.products.push(product);
    },
    remove(product) {
      this.$emit('remove', product);
    },
  },
};
</script>