import Vue from 'vue';
import SerialPort from 'serialport';
import { Readline } from 'serialport/lib/parsers';
import { Subject } from 'rxjs';

const event = new Subject();
const message = new Subject();

let client = {}
SerialPort.list((err, list) => {
  if (err) return;
  const target = list.find(({ productId }) => productId === '6001');
  client = new SerialPort(target.comName, {
    baudRate: 38400,
    autoOpen: true,
  });

  Vue.prototype.$serial = client;
  Vue.prototype.$serial.status = event;
  Vue.prototype.$serial.response = message;

  // 연결시
  client.on('open', () => {
    console.log('open serial');
    event.next('open');
    const parser = client.pipe(new Readline({ delimiters: '\r\n' }));
    parser.on('data', data => {
      console.log(`response: ${data.trim()}`);
      message.next(data.trim());
    });
  });

  // 종료시
  client.on('close', () => {
    event.next('close');
  });
});
