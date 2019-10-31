import { of, zip } from 'rxjs';
import { take, filter, tap, map } from 'rxjs/operators';

export default {
  methods: {
    sendSerial(msg) {
      return of(this.$serial.write(`[${msg}]\r\n`)).pipe(
        tap(state => {
          if (!state) throw new Error('요청 오류');
        }),
      );
    },

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

    async pay(method, amount, products) {},
  },
};
