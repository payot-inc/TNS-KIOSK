import { of, zip } from 'rxjs';
import { take, filter, tap, map } from 'rxjs/operators';
import numeral from 'numeral';

export default {
  methods: {
    sendSerial(msg) {
      return of(this.$serial.write(`[${msg}]\r\n`)).pipe(
        tap(state => {
          if (!state) throw new Error('요청 오류');
        }),
      );
    },

    async request(commend, filter) {
      const response = this.$serial.response.pipe(
        filter(res => filter.test(res)),
        take(1),
      );

      return zip(this.sendSerial(commend), response).pipe(([, data]) => {
        return data;
      });
    },

    // 장비로 부터 재고목록 요청
    async getProductList() {
      const commend = 'q A X';
      const okRegex = /^\[r A ([Q-S]{1}[\d]{3}\/[Q-S]{1}[\d]{3}\/[Q-S]{1}[\d]{3}&){0,}([Q-S]{1}[\d]{3}\/[Q-S]{1}[\d]{3}\/[Q-S]{1}[\d]{3})\]$/;
      const response = this.$serial.response.pipe(
        filter(res => okRegex.test(res)),
        take(1),
      );

      return zip(this.sendSerial(commend), response)
        .pipe(
          map(([, data]) => {
            return data
              .replace(/^\[/, '')
              .replace(/\]$/, '')
              .split(' ')[2]
              .split('&')
              .map(row => {
                return row.split('/').reduce((acc, item) => {
                  const [type, ...valueArray] = item;
                  const value = valueArray.join('').toUpperCase();
                  let obj = {};
                  obj[{ Q: 'machine', R: 'product', S: 'count' }[type]] = value;
                  return { ...acc, ...obj };
                }, {});
              });
          }),
        )
        .toPromise();
    },

    // 장비로 부터 금액 투입 명령 생성
    payCommendBuilder(method, products, amount) {
      const productCommends = products
        .map(({ id, machineId, price }) => {
          const productId = id.substring(3, id.length);
          const productAmount = numeral(Number(price) / 100).format('000');
          return `Q${machineId}/R${productId}/S${productAmount}`;
        })
        .join('&');
      const totalAmount = numeral(amount).format('000000');
      const methodCommend = method === 'cash' ? 'B' : 'C';
      const methodInput = method === 'cash' ? 'T' : 'U';

      return `[q ${methodCommend} ${methodInput}${totalAmount}&${productCommends}]`;
    },

    // 결제 진행
    async pay(method = 'cash', amount, products) {
      // const commendString = this.payCommendBuilder(method, products, amount);
      // const zipObervers = [];

      // switch (method) {
      //   case 'cash':
      //     const returnCoinObserver = this.$serial.response.pipe(filter());
      //     const valideOkObserver = this.$serial.response.pipe(filter());
      //     zipObervers.push([returnCoinObserver, valideOkObserver]);
      //     break;
      //   case 'card':
      //   default:
      //     const mobilePayObserver = this.$socket.response.pipe(filter());
      //     const valideOkObserver = this.$serial.response.pipe(filter());
      //     zipObervers.push([mobilePayObserver, valideOkObserver]);
      //     break;
      // }

      // 상품목록 결제
      const commendProductParams = products
        .map(({ machineId, id, price }) => {
          const productId = id.substring(3, id.length);
          return `Q${machineId}/R${productId}/S${numeral(Number(price) / 100).format('000')}`;
        })
        .join('&');

      // 결제 타입
      const type = { cash: 'T', card: 'U' }[method];
      const formatAmount = numeral(amount).format('000000');
      const commend = `[q B ${type}${formatAmount}&${commendProductParams}]`;

      const okRegex = /^\[r B Ya&V[\d]{6}\]$/;
      this.$serial.write(commend);

      return this.$serial.response.pipe(
        filter(msg => okRegex.test(msg)),
        map(result => {
          const data = result
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .split(' ')[2];
          const [, ...amount] = data.split('&')[1];
          return Number(amount.join(''));
        }),
      );
    },
  },
};
