import tracker from "../utils/tracker";

export function injectXHR() {
  const XMLHttpRequest = window.XMLHttpRequest;
  const oldOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, async) {
    if (!url.match(/logstores/)) {
      this.logData = { method, url, async };
    }
    return oldOpen.apply(this, arguments);
  };
  const oldSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (body) {
    if (this.logData) {
      let startTime = Date.now();; // 在发送之前记录一下开始时间
      const handler = (type) => (event) => {
        const duration = Date.now() - startTime;
        const status = this.status; // 200 404 500
        const statusText = this.statusText; // OK Server Error
        tracker.send({
          kind: 'stability',
          type: 'xhr',
          eventType: type, // load error abort
          pathname: this.logData.url, // 请求路径
          status: status + '-' + statusText, // 状态码
          duration, // 持续时间
          response: this.response ? JSON.stringify(this.response) : '', // 响应体
          params: body || ''
        });
      };
      // this.addEventListener('load', handler('load'), false);
      this.addEventListener('error', handler('error'), false);
      this.addEventListener('abort', handler('abort'), false);
    }
    return oldSend.apply(this, arguments);
  };
}
