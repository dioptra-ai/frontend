import Color from 'color';

// Generated with #1FA9C8 at http://vrl.cs.brown.edu/color
const COLORS = ['#1aa9c9', '#710c9e', '#76f014', '#1e438d', '#83d996', '#82252a', '#bce333', '#e71761', '#0df38f', '#2f4d3e', '#c1c2f5', '#167b2b', '#f75ef0', '#6782c9', '#ffa8ff', '#3f16f9', '#f3d426', '#846dff', '#c2cba1', '#e65201', '#798a58', '#fea53b', '#cc617d', '#f7b8a2'];

export const getHexColor = (fromValue, alpha = 1) => {
    if (fromValue === '') {

        return Color('#C5CCD3').alpha(alpha).string();
    } else {
        const fromValueString = String(fromValue);
        const sum = fromValueString.split('').reduce((agg, _, i) => fromValueString.charCodeAt(i) + agg, 0);

        return Color(COLORS[sum % COLORS.length]).alpha(alpha).string();
    }
};
