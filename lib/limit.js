module.exports = function PromiseLimit(funcArray, limit = 5) {

    let i = 0;
    const result = [];
    const executing = [];
    const queue = function () {
        if (i === funcArray.length) return Promise.all(executing);
        const p = funcArray[i++]();
        result.push(p);
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= limit) {

            return Promise.race(executing).then(
                () => queue(),
                e => Promise.reject(e)
            );
        }
        return Promise.resolve().then(() => queue());
    };
    return queue().then(() => Promise.all(result));
}
