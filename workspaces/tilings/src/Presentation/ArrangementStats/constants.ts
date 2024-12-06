import colors from 'open-color';

const hexToRgb = (hex: string): [number, number, number] => {
  const hexValue = hex.replace('#', '');
  return [
    parseInt(hexValue.substring(0, 2), 16),
    parseInt(hexValue.substring(2, 4), 16),
    parseInt(hexValue.substring(4, 6), 16),
  ];
};

export const colorPath = colors.red[5];
export const colorTransform = colors.green[5];
export const colorValidationLight = `rgba(${hexToRgb(colors.yellow[2])}, 0.5)`;
export const colorValidation = colors.yellow[5];
export const colorRender = colors.blue[5];
