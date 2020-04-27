import Vue from 'vue';
import SerialPort from 'serialport';
import { http } from './axios';
import { Subject, zip, of } from 'rxjs';
import { map, filter, take, timeout } from 'rxjs/operators';

let client = {};
const status = new Subject(false);
const response = new Subject({});

// 메시지 보내기
const sendObserver = message => {
  const commend = `[${message}]`;
  return of(client.write(commend + '\r\n'));
};

// 메시지 수신시 파싱
const messageParser = str => {
  console.log(str);
  const message = str.trim();
  const dataBody = message.slice(1, str.length - 1);
  const [t, cmd, data] = dataBody.split(' ');
  const type = { r: 'response', q: 'request' }[t];
  const commend = { A: 'stock', B: 'cash', C: 'card', D: 'coin', E: 'error', F: 'resume' }[cmd];

  return { type, commend, data };
};

// 메시지 요청하기 (괄호 없는 전송할 메시지), 핸들링할 이벤트 처리, 대기시간
export const request = (message, handle, timeover = 1000 * 10) => {
  const reqMessage = messageParser(`[${message}]`);

  return zip(
    sendObserver(message),
    response.pipe(
      filter(res => res.type === 'response'),
      filter(res => res.commend === reqMessage.commend),
      filter(res => (handle ? handle(res) : true)),
    ),
  )
    .pipe(
      map(([, response]) => response.data),
      take(1),
      timeout(timeover),
    )
    .toPromise();
};

// 장비 연결
const connect = async () => {
  const list = await SerialPort.list();
  const target = list.find(({ productId }) => productId === '6001');
  const path = target ? target.comName : '/dev/tty.SLAB_USBtoUART';
  const port = new SerialPort(path, {
    baudRate: 230400,
    autoOpen: true,
  });
  const parser = port.pipe(new SerialPort.parsers.Readline({ delimiter: '\r\n' }));
  parser.on('data', data => {
    const msg = messageParser(data);
    response.next(msg);
  });
  port.on('open', () => {
    console.log('open serial');
    status.next(true);
  });
  port.on('close', () => status.next(false));

  return { port, parser };
};

// 장비와 연결하기
connect()
  .then(({ port, parser }) => {
    client = port;
    Vue.prototype.$serial = port;
    Vue.prototype.$serial.parser = parser;
    Vue.prototype.$serial.status = status;
    Vue.prototype.$serial.request = request;
    Vue.prototype.$serial.response = response;
  })
  .catch(console.log);

// 오류 상황
response
  .pipe(
    filter(({ commend }) => commend === 'error'),
    map(({ data }) => {
      return data
        .split('&')
        .map(str => str.slice(1, str.length))
        .map(id => ({ id, isBroken: true }));
    }),
  )
  .subscribe(params => {
    console.log('장비 고장 목록', params);
    // console.log(http);
    http.post('/machine/error', params);
  }, console.log);

// 오류 수정사항
response
  .pipe(
    filter(({ commend }) => commend === 'resume'),
    map(({ data }) => {
      return data
        .split('&')
        .map(str => str.slice(1, str.length))
        .map(id => ({ id, isBroken: false }));
    }),
  )
  .subscribe(params => {
    console.log('장비 정상화 목록', params);
    http.post('/machine/error', params);
  }, console.log);

response
  .pipe(
    filter(({ type, commend, data }) => {
      if (type !== 'response') return false;
      if (commend !== 'cash') return false;
      return /^U[\d]{6}$/.test(data);
    }),
    map(({ data }) => Number(data.slice(1, data.length))),
  )
  .subscribe(price => {
    http.post('/insert/coin', { amount: price });
  }, console.log);
