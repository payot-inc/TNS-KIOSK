import { filter, map } from 'rxjs/operators';
import { mapState, mapMutations } from 'vuex';
import { chain, isEmpty, difference } from 'lodash';
import numeral from 'numeral';

export default {
  computed: {
    ...mapState(['buckets', 'bucketList']),
  },
  methods: {
    ...mapMutations({
      setBuckets: 'SET_BUCKET',
      setBucektList: 'SET_BUCEKT_LIST',
    }),

    // 금액 들어오는 이벤트
    inputCashObserver() {
      const filterCommend = ({ type, commend, data }) => {
        if (type !== 'response') return false;
        if (commend !== 'cash') return false;
        return /^U[\d]{6}$/.test(data);
      };
      const mapping = ({ data }) => Number(data.slice(1, data.length));
      return this.$serial.response.pipe(
        filter(data => filterCommend(data)),
        map(mapping),
      );
    },

    // 결제하기
    async payment(method = 'cash', products) {
      const totalAmount = chain(products)
        .map(({ price }) => Number(price))
        .sum()
        .value();
      const commendString = method === 'cash' ? 'B' : 'C';
      const dataTypeString = method === 'cash' ? 'T' : 'U';
      const amount = numeral(totalAmount).format('000000');
      const productList = products
        .map(({ machineId, id, price }) => {
          const productCode = id.slice(3, id.length);
          return [
            'Q' + numeral(machineId).format('000'),
            'R' + numeral(productCode).format('000'),
            'S' + numeral(price / 100).format('000'),
          ].join('/');
        })
        .join('&');
      const requestString = `q ${commendString} ${dataTypeString}${amount}&${productList}`;
      // 요청응답 필터
      const requestFilter = ({ data }) => {
        const [value1, value2] = data;
        const errorType = { e: 'request-error', c: 'return', d: 'timeout-error', i: 'error' };
        if (value1 !== 'Y') return false;
        if (errorType[value2]) throw new Error(errorType[value1]);

        return value2 === 'a';
      };

      return await this.$serial.request(requestString, requestFilter, 60 * 1000);
    },

    // 재고목록 조회하기
    async getBuckets() {
      const stockRequest = 'q A X';
      const stockResponse = await this.$serial.request(stockRequest);
      // 재고목록 맵핑
      const stock = chain(stockResponse.split('&'))
        .map(item => {
          const [m, p, s] = item.split('/');
          return {
            machine: m.slice(1, m.length),
            product: p.slice(1, m.length),
            count: s.slice(1, m.length),
          };
        })
        .sortBy(['machine', 'product'])
        .value();
      
      const hasStockListString = JSON.stringify(this.buckets);
      
      if (hasStockListString !== JSON.stringify(stock)) {
        this.setBuckets(stock);
        const diffrentRows = difference(stock, JSON.parse(hasStockListString));
        console.log('재고목록 변동사항', diffrentRows);
        const { data } = await this.$axios.put('/products', diffrentRows);
        this.setBucektList(data);
      }

      return this.bucketList;
    },

    // 잔돈 목록 가져오기
    async getCoins() {
      const coinRequest = 'q D X';
      const coinResponse = await this.$serial.request(coinRequest);
      const coins = coinResponse
        .split('&')
        .map(([key, ...value]) => {
          const keySet = { K: 'coin10', L: 'coin50', M: 'coin100', N: 'coin500', O: 'coin1000' }[
            key
          ];
          let result = {};
          result[keySet] = Number(value.join('').toString());
          return result;
        })
        .reduce((acc, value) => ({ ...acc, ...value }), {});
      await this.$axios.put('/coins', coins);
    },

    // 재고목록 최신화
    async stockList() {
      await this.getCoins();
      return await this.getBuckets();
    },

    fakeDeviceError() {
      this.$serial.parser.send(`[q E Q 001&015&900&910]\r\n`);
    },
  },
};
