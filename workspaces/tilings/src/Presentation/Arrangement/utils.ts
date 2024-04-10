const superscriptMap: Record<string, number> = {
  '⁰': 0,
  '¹': 1,
  '²': 2,
  '³': 3,
  '⁴': 4,
  '⁵': 5,
  '⁶': 6,
  '⁷': 7,
  '⁸': 8,
  '⁹': 9,
};

export const expandNotationBlock = (notation: string): string[] => {
  const partsWithSuperScripts = notation.split('.');
  const parts = [];

  for (const part of partsWithSuperScripts) {
    const superscript = /([0-9]+)(\p{No})/gu.exec(part);

    if (superscript) {
      const [, shape, multiplier] = superscript;

      for (let i = 0; i < superscriptMap[multiplier]; i++) {
        parts.push(shape);
      }
    } else {
      parts.push(part);
    }
  }

  return parts;
};

export const expandNotation = (notation: string) => {
  return notation.split(';').map(expandNotationBlock);
};
