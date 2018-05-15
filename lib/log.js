function log(metaValues = [], ...details) {
    const meta = metaValues.reduce((memo, value) => memo + '[' + value + ']', '');
    console.log(meta, ...details);
}

module.exports = log;
