export const deepDropNulls = (obj) => {
    if (obj === null) {
        return null;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepDropNulls);
    }

    if (typeof obj === 'object') {
        return Object.keys(obj)
            .filter((key) => obj[key] !== null)
            .reduce((acc, key) => ({...acc, [key]: deepDropNulls(obj[key])}), {});
    }

    return obj;
};
