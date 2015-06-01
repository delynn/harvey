var KEY = '52b3da30-b0de-4b74-8f95-2fc4503f0515',
    SDC = require('statsd-client'),
    sdc = new SDC({host: 'carbon.hostedgraphite.com', port: 2003});

module.exports = function(actionInfo, variables, parseValueFn, step) {
  var metrics = [
    KEY,
    'harvey',
    step.request.host.split('.').reverse().join('.'),
    step.id,
    'duration'
  ];
  var duration = variables.stop - variables.start;
  console.log('echo "' + metrics.join('.') + ' ' + duration + '" | nc carbon.hostedgraphite.com 2003');
  sdc.gauge(metrics.join('.'), duration, variables.start);
}
