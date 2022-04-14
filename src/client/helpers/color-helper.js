const COLORS = [
    '#1FA9C8',
    '#8ED4E3',
    '#F8C86C',
    '#62BD6C',
    '#B1EAB7',
    '#F8886C'
];

export const getHexColor = (fromValue) => {
    if (fromValue) {
        const fromValueString = String(fromValue);
        const sum = fromValueString.split('').reduce((agg, _, i) => fromValueString.charCodeAt(i) + agg, 0);

        return COLORS[sum % COLORS.length];
    } else {

        return '#E5E5E5';
    }
};
