import SerialPort from 'serialport';
import { Readline } from 'serialport/lib/parsers';
import { chain } from 'lodash';
import { Subject } from 'rxjs';

function findDevice(fn) {
  return new Promise((resolve, reject) => {
    SerialPort.list((err, list) => {
      if (err) return reject(err);
      if (list.some(fn)) return resolve(list.filter(fn)[0].comName);
      else return reject(new Error('Empty Device'));
    })
  });
}

const path = '/dev/tty.SLAB_USBtoUART';
const event = new Subject();
const message = new Subject();

const client = new SerialPort(path, {
  baudRate: 38400,
  autoOpen: true,
});

// 연결시
client.on('open', () => {
  event.next('open');
  const parser = client.pipe(new Readline({ delimiters: '\r\n' }));
  parser.on('data', data => {
    console.log(data);
    message.next(data.trim());
  });
});

// 종료시
client.on('close', () => {
  event.next('close');
});

export const state = event;
export const response = message;

export default client;
