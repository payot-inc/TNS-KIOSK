<template>
  <div class="list">
    <div class="machine">
      <ul>
        <li
          v-for="m in machines"
          :key="m"
          :class="{ on: selectMachineId === m }"
          @click="selectMachineId = m"
        >
          <strong>{{ m | numeral('00') }}</strong>
          <span>자판기</span>
        </li>
      </ul>
    </div>
    <div class="items">
      <div class="row" v-for="(batchProducts, index) in machineProducts" :key="index">
        <a class="col-md-4" v-for="p in batchProducts" :key="p.id" @click="$emit('select', p)">
          <dl>
            <dt>
              <img :src="p.img" :alt="p.img" />
              <span class="number">{{ p.count }}개</span>
            </dt>
            <dd>{{ p.price | numeral('0,0') }}원</dd>
          </dl>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { chain, get } from 'lodash';
import numeral from 'numeral';

export default {
  props: ['products'],
  data() {
    return {
      selectMachineId: '',
    };
  },
  computed: {
    machines() {
      return chain(this.products)
        .uniqBy('machineId')
        .map('machineId')
        .value();
    },
    machineProducts() {
      return chain(this.products)
        .filter(['machineId', this.selectMachineId])
        .map((item, index) => {
          return { ...item, img: `products/${(index % 41) + 1}.jpg` };
        })
        .chunk(3)
        .value();
    },
  },
  watch: {
    machines(newValue) {
      this.selectMachineId = newValue[0];
    },
  },
};
</script>
