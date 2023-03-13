
export const getHistogram = (values, getClassName, initialHistogram = {}) => values.reduce((acc, value) => {
    const name = getClassName(value);

    if (name) {
        if (!acc[name]) {
            acc[name] = 0;
        }
        acc[name] += 1;
    }

    return acc;
}, initialHistogram);

