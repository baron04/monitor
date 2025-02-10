import onload from '../utils/onload';
import tracker from '../utils/tracker';
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';

export function timing() {
  let FMP, LCP;
  // 增加一个性能条目的观察者
  new PerformanceObserver((entryList, observer) => {
    const perfEntries = entryList.getEntries();
    FMP = perfEntries[0];
    observer.disconnect(); // 不再观察了
  }).observe({ entryTypes: ['element'] }); // 观察页面中有意义的元素

  new PerformanceObserver((entryList, observer) => {
    const perfEntries = entryList.getEntries();
    LCP = perfEntries[0];
    observer.disconnect(); // 不再观察了
  }).observe({ entryTypes: ['largest-contentful-paint'] }); // 观察页面中最大的元素

  new PerformanceObserver((entryList, observer) => {
    const lastEvent = getLastEvent();
    const perfEntries = entryList.getEntries();
    const firstInput = perfEntries[0];
    if (firstInput) {
      const inputDelay = firstInput.processingStart - firstInput.startTime; // 处理延迟
      const duration = firstInput.duration; // 处理耗时
      if (inputDelay > 0 || duration > 0) {
        tracker.send({
          kind: 'experience', // 用户体验指标
          type: 'firstInputDelay', // 首次输入延迟
          inputDelay, // 延迟时间
          duration, // 处理耗时
          startTime: firstInput.startTime,
          processingStart: firstInput.processingStart,
          selector: lastEvent ? getSelector(lastEvent.composedPath()) : '', // 代表最后一个操作的元素
        });
      }
    }
    observer.disconnect(); // 不再观察了
  }).observe({ type: 'first-input', buffered: true });

  onload(function () {
    setTimeout(() => {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      console.log('navigationTiming', navigationTiming);
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domInteractive,
        domComplete,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart,
      } = navigationTiming;
      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'timing', // 统计每个阶段的时间
        connectTime: connectEnd - connectStart, // 建联时间
        ttfbTime: responseStart - requestStart, // 首字节到达时间
        responseTime: responseEnd - responseStart, // 响应的读取时间
        parseDOMTime: domComplete - domInteractive, // DOM解析时间
        domContentLoadedTime:
          domContentLoadedEventEnd - domContentLoadedEventStart, // DOMContentLoaded事件回调时间
        timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
        loadTime: loadEventStart - fetchStart, // 完整的加载时间
      });

      // 开始发送性能指标
      const FP = performance.getEntriesByName('first-paint')[0];
      const FCP = performance.getEntriesByName('first-contentful-paint')[0];
      console.log('FP', FP);
      console.log('FCP', FCP);
      console.log('FMP', FMP);
      console.log('LCP', LCP);
      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'paint', // 统计每个阶段的时间
        firstPaint: FP.startTime, // 首次绘制
        firstContentfulPaint: FCP.startTime, // 首次有内容的绘制
        firstMeaningfulPaint: FMP.startTime, // 首次有意义的绘制
        largestContentfulPaint: LCP.startTime, // 最大内容绘制
      })
    }, 3000);
  });
}
