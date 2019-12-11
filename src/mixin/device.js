import { filter, map, tap } from 'rxjs/operators';
import { chain } from 'lodash';
import numeral from 'numeral';

export default {
  methods: {
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
        .sumBy('price')
        .value();
      const commendString = method === 'cash' ? 'B' : 'C';
      const dataTypeString = method === 'cash' ? 'T' : 'U';
      const amount = numeral(totalAmount).format('000000');
      const productList = products
        .map(({ machine, product, price }) => {
          return [
            'Q' + numeral(machine).format('000'),
            'R' + numeral(product).format('000'),
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

    // 재고보유 현황 (서버로 부터의 재고목록 및 잔액 싱크)
    async stockList() {
      const stockRequest = 'q A X';
      const coinRequest = 'q D X';

      // 장비로부터 재고현황 조회
      const stockResponse = await this.$serial.request(stockRequest);
      // 장비로부터 잔돈현황 조회
      // const coinResponse = await this.$serial.request(coinRequest);

      // 재고목록 맵핑
      const stock = stockResponse.split('&').map(item => {
        const [m, p, s] = item.split('/');
        return {
          machine: m.slice(1, m.length),
          product: p.slice(1, m.length),
          count: s.slice(1, m.length),
        };
      });
      console.log(stock);
      // 잔돈 맵핑
      // const coins = coinResponse
      //   .split('&')
      //   .map(([key, ...value]) => {
      //     const keySet = { K: 'coin10', L: 'coin50', M: 'coin100', N: 'coin500', O: 'coin1000' }[
      //       key
      //     ];
      //     let result = {};
      //     result[keySet] = Number(value.join('').toString());
      //     return result;
      //   })
      //   .reduce((acc, value) => ({ ...acc, ...value }), {});
      // 상품내역 업데이트 및 조회
      const { data: serverStockList } = await this.$axios.put('/products', stock);
      // 잔액내역 업데이트
      // await this.$axios.put('/coins', coins);

      return serverStockList;
    },

    fakeDeviceError() {
      this.$serial.parser.send(`[q E Q 001&015&900&910]\r\n`);
    }
  },
};
