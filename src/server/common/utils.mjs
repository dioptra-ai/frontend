const unionMerge = function(collection1, collection2, options) {
    const key1Selector = options?.key1Selector ?? ((item) => item.key);
    const key2Selector = options?.key2Selector ?? ((item) => item.key);
    const value1Selector = options?.value1Selector ?? ((item) => item.value);
    const value2Selector = options?.value2Selector ?? ((item) => item.value);

    const result = [];
    const map2 = new Map(collection2.map((item) => [key2Selector(item), value2Selector(item)]));

    collection1.forEach((item) => {
        const key = key1Selector(item);

        const value2 = map2.get(key);

        if (!value2) {
            result.push({key, values: [value1Selector(item), 0]});
        } else {
            result.push({key, values: [value1Selector(item), value2]});
            map2.delete(key);
        }
    });
    if (map2.size > 0) {
        map2.forEach((value, key) => {
            result.push({key, values: [0, value]});
        });
    }

    return result;
};

export {unionMerge};
