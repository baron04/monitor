import getSelector from '../utils/getSelector';
import onload from '../utils/onload';
import tracker from '../utils/tracker';

export function blankScreen() {
  const wrapperElements = ['html', 'body', '#container', '.content'];
  let emptyPoints = 0;

  function getSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    if (element.className) {
      // a b c => .a.b.c
      const className = element.className
        .split(' ')
        .filter((item) => !!item)
        .join('.');
      return `.${className}`;
    }
    return element.nodeName.toLowerCase();
  }

  function isWrapper(element) {
    const selector = getSelector(element);
    if (wrapperElements.indexOf(selector) !== -1) {
      emptyPoints++;
    }
  }

  onload(function () {
    for (let i = 1; i <= 9; i++) {
      let xElements = document.elementsFromPoint(
        (window.innerWidth * i) / 10,
        window.innerHeight / 2
      );
      let yElements = document.elementsFromPoint(
        window.innerWidth / 2,
        (window.innerHeight * i) / 10
      );
      isWrapper(xElements[0]);
      isWrapper(yElements[0]);
    }
    console.log('emptyPoints', emptyPoints);

    if (emptyPoints > 16) {
      const centerElement = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      tracker.send({
        kind: 'stability',
        type: 'blank',
        emptyPoints,
        screen: window.screen.width + 'X' + window.screen.height,
        viewPoint: window.innerWidth + 'X' + window.innerHeight,
        selector: getSelector(centerElement),
      });
    }
  });
}
