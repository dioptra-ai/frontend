
const COLORS = [
    '#11C8BD',
    '#1FA9C8',
    '#2C7EAC',
    '#439E67',
    '#62BD6C',
    '#735BA7',
    '#855C8C',
    '#95D960',
    '#B87FC7',
    '#D27117',
    '#EE90CE',
    '#F8886C',
    '#F8C86C'
];

export const getHexColor = (fromValue) => {
    if (fromValue === '') {

        return '#C5CCD3';
    } else {
        const fromValueString = String(fromValue);
        const sum = fromValueString.split('').reduce((agg, _, i) => fromValueString.charCodeAt(i) + agg, 0);

        return COLORS[sum % COLORS.length];
    }
};
