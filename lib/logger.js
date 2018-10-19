function log(metaValues = [], ...details) {
  if(log.ignore) return;
  
  const meta = metaValues.reduce((memo, value) => `${memo}[${value}]`, '');
  console.log(meta, ...details);
}

log.ignore = false;

module.exports = log;