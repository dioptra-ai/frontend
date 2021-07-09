const unionMerge = function(collection1, collection2, options) {
    let key1Selector = options?.key1Selector;

    if (!key1Selector) {
        key1Selector = (item) => item.key;
    }

    let key2Selector = options?.key2Selector;

    if (!key2Selector) {
        key2Selector = (item) => item.key;
    }

    let value1Selector = options?.value1Selector;

    if (!value1Selector) {
        value1Selector = (item) => item.value;
    }

    let value2Selector = options?.value2Selector;

    if (!value2Selector) {
        value2Selector = (item) => item.value;
    }

    const result = [];
    const map2 = new Map(collection2.map((item) => [key2Selector(item), value2Selector(item)]));

    collection1.forEach((item) => {
        const key = key1Selector(item);

        const value2 = map2.get(key);

        if (!value2) {
            result.push({key, values: [value1Selector(item), 0]});
        } else {
            result.push({key, values: [value1Selector(item), value2]});
        }
        map2.delete(key);
    });
    if (map2.length > 0) {
        map2.forEach((value, key) => {
            result.push({key, values: [0, value]});
        });
    }

    return result;
};

export {unionMerge};
