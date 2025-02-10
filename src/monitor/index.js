const { injectBlankScreen } = require('./lib/blankScreen');
const { injectJsError } = require('./lib/jsError');
const { injectXHR } = require('./lib/xhrError');

injectJsError();
injectXHR();
injectBlankScreen();
