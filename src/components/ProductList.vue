<template>
  <div class="list">
    <div class="machine">
      <ul>
        <li
          v-for="(m, index) in machines"
          :key="m"
          :class="{ on: selectMachineId === m }"
          @click="selectMachineId = m"
        >
          <strong>{{ (index + 1) | numeral('00') }}</strong>
          <span>자판기</span>
        </li>
      </ul>
    </div>
    <div class="items">
      <div class="row" v-for="(batchProducts, index) in machineProducts" :key="index">
        <a class="col-md-4" v-for="p in batchProducts" :key="p.id" @click="$emit('select', p)">
          <dl>
            <dt>
              <!-- <img src="@/assets/img/p01.png" /> -->
              <label>{{ p.name }}</label>
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