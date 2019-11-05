<template>
  <div id="contents">
    <div class="header">
      <router-link to="/" class="back">
        <i class="material-icons">keyboard_backspace</i>
      </router-link>
      <router-link to="/" class="home">
        <i class="material-icons">home</i>
      </router-link>
    </div>
    <div class="sub product">
      <div class="inner">
        <div class="sub_title">
          <h2>상품선택</h2>
          <p>자판기에 있는 상품을 선택 해 주세요</p>
          <span></span>
        </div>

        <product-list-component :products="list" @select="selectProduct($event)" />

        <product-select-component
          :products="selected"
          @remove="unsetProduct($event)"
          @submit="pay"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ProductListComponent from '@/components/ProductList.vue';
import ProductSelectComponent from '@/components/ProductSelect.vue';

import API from '@/mixin/api';

import { chain, findIndex } from 'lodash';

export default {
  components: {
    ProductListComponent,
    ProductSelectComponent,
  },
  mixins: [API],
  data() {
    return {
      list: [],
      selected: [],
    };
  },
  async mounted() {
    const modal = this.$bvModal.msgBoxOk('상품 목록을 불러오는 중 입니다', {
      centered: true,
      noCloseOnBackdrop: true,
    });
    setTimeout(async () => {
      await this.bindProduct();
      console.log(await modal);
    }, 3000);
  },
  methods: {
    async bindProduct() {
      const list = await this.getProductList();
      const { data } = await this.$axios.put('/products', list);
      this.list = data;
    },

    selectProduct(product) {
      try {
        const { machineId } = product;
        if (this.selected.some(({ machineId: id }) => id === machineId))
          throw new Error('이미 등록된 상품입니다');

        this.selected.push(product);
      } catch (error) {
        this.$bvModal.msgBoxOk('이미 선택한 자판기의 상품은 선택하실 수 없습니다', {
          centered: true,
          size: 'lg',
          okTitle: '확인',
        });
      }
    },

    unsetProduct(product) {
      if (product instanceof Array) {
        this.selected = [];
      } else {
        const index = findIndex(this.selected, product);
        this.selected.splice(index, 1);
      }
    },

    pay() {
      try {
        const products = this.selected;
        if (products.length === 0) throw new Error('상품을 선택해 주세요');
        this.$router.push({ name: 'pay', params: { products } });
      } catch (error) {
        this.$bvModal.msgBoxOk('상품을 선택해 주세요', {
          centered: true,
          okTitle: '확인',
          size: 'lg',
        });
      }
    },
  },
};
</script>