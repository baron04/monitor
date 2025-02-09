
import userAgent from 'user-agent';
const host = 'cn-shanghai.log.aliyuncs.com'
const project = 'zhufeng-monitor'
const logStore = 'zhufengmonitor-store'

function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).name
    // 用户id
  }
}

// gif图片做上传 图片速度快 没有跨域问题
class SendTracker {
  constructor() {
    this.url = `https://${project}.${host}/logstores/${logStore}/track` //上报的路径
    this.xhr = new XMLHttpRequest
  }

  send(data = {}) {
    const extraData = getExtraData()
    const log = { ...extraData, ...data }
    // 对象的值不能是数字（阿里云规定）
    for (const key in log) {
      if (typeof log[key] === 'number') {
        log[key] = String(log[key]);
      }
    }
    console.log('log', log)

    this.xhr.open('POST', this.url, true)
    const body = JSON.stringify({
      __logs__: [log]
    })
    this.xhr.setRequestHeader('Content-Type', 'application/json') // 请求体类型
    this.xhr.setRequestHeader('x-log-apiversion', '0.6.0') //版本号
    this.xhr.setRequestHeader('x-log-bodyrawsize', body.length) //  请求体的大小
    this.xhr.onload = function () {
      // console.log(this.xhr.response)
    }
    this.xhr.onerror = function (error) {
      console.log(error)
    }
    this.xhr.send(body)
  }
}

export default new SendTracker()