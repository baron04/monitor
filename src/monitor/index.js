const { injectJsError } = require('./lib/jsError');
const { injectXHR } = require('./lib/xhrError');
const { blankScreen } = require('./lib/blankScreen');
const { timing } = require('./lib/timing');

injectJsError();
injectXHR();
blankScreen();
timing();
