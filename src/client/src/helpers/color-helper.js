const convertToHex = (n) => Math.floor(n * 16777215).toString(16);

export const getRandomHexColor = (opacity = 1) => `#${convertToHex(Math.random())}${convertToHex(opacity).substr(0, 2)}`;
