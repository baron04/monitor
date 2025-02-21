import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';
import tracker from '../utils/tracker';

export function injectJsError() {
  // 监听全局未捕获的错误
  window.addEventListener('error', function (event) {
    console.log("error", event); //  错误事件对象
    const lastEvent = getLastEvent(); // 最后一个交互事件
    if (lastEvent) {
      console.log(lastEvent, lastEvent.path, lastEvent.composedPath());
    }

    if (event.target && (event.target.src || event.target.href)) {
      tracker.send({
        kind: 'stability', // 监控指标的大类
        type: 'error', // 小类型，这是一个错误
        errorType: 'resourceError',
        filename: event.target.src || event.target.href,
        tagName: event.target.tagName,
        selector: getSelector(event.target),
      })
    } else {
      const log = {
        kind: 'stability', // 监控指标的大类
        type: 'error', // 小类型，这是一个错误
        errorType: 'jsError', // JS执行错误
        message: event.message,
        filename: event.filename, // 哪个文件报错了
        position: `${event.lineno}:${event.colno}`,
        stack: getLines(event.error ? event.error.stack : ''),
        selector: lastEvent ? getSelector(lastEvent.composedPath()) : '', // 代表最后一个操作的元素
      };
  
      // console.log(log);
      tracker.send(log);
    }
  }, true);

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      console.log('unhandledrejection', event);
      const lastEvent = getLastEvent();
      let message;
      let filename;
      let line = 0;
      let column = 0;
      let stack = '';
      const reason = event.reason;
      if (typeof reason === 'string') {
        message = reason;
      } else if (typeof reason === 'object') {
        message = reason.message;
        if (reason.stack) {
          let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
          filename = matchResult[1];
          line = matchResult[2];
          column = matchResult[3];
        }
        stack = getLines(reason.stack);
      }
      tracker.send({
        kind: 'stability', // 监控指标的大类
        type: 'error', // 小类型，这是一个错误
        errorType: 'promiseError',
        message,
        filename,
        position: `${line}:${column}`,
        stack,
        selector: lastEvent ? getSelector(lastEvent.composedPath()) : '', // 代表最后一个操作的元素
      });
    },
    true
  );
}

function getLines(stack) {
  return stack
    .split('\n')
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ''))
    .join('^');
}
