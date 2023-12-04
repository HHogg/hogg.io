import { Text, TextProps } from 'preshape';
import { useEffect, useState } from 'react';
import text1 from './text1.txt?raw';
import text2 from './text2.txt?raw';
import text3 from './text3.txt?raw';
import text4 from './text4.txt?raw';

const texts = [text1, text2, text3, text4];

export default function Ascii(props: TextProps) {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => {
        const next = prev + 1;
        return next < texts.length ? next : 0;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text {...props} absolute="left" zIndex={-1}>
      <pre>{texts[textIndex]}</pre>
    </Text>
  );
}
