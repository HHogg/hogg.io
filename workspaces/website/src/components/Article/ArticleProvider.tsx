import { PropsWithChildren, useCallback, useState } from 'react';
import { ArticleContext, ArticleContextProps } from './useArticleContext';

export default function ArticleProvider({ children }: PropsWithChildren) {
  const [figures, setFigures] = useState<[HTMLElement, DOMRect][]>([]);

  const insertIntoFigures = useCallback((element: HTMLElement) => {
    setFigures((figures) => {
      const nextFigures: typeof figures = [
        ...figures,
        [element, element.getBoundingClientRect()],
      ];

      nextFigures.sort((a, b) => a[1].top - b[1].top || a[1].left - b[1].left);

      return nextFigures;
    });
  }, []);

  const removeFromFigures = useCallback((element: HTMLElement) => {
    setFigures((figures) => figures.filter(([figure]) => figure !== element));
  }, []);

  const registerFigure: ArticleContextProps['registerFigure'] = useCallback(
    (ref) => {
      if (ref.current !== null) {
        insertIntoFigures(ref.current);
      }
      return () => {
        if (ref.current !== null) {
          removeFromFigures(ref.current);
        }
      };
    },
    [insertIntoFigures, removeFromFigures]
  );

  const getFigureNumber: ArticleContextProps['getFigureNumber'] = useCallback(
    (ref) => {
      if (ref.current === null) {
        return -1;
      }

      const index = figures.findIndex(([figure]) => figure === ref.current);

      if (index === -1) {
        return -1;
      }

      return index + 1;
    },
    [figures]
  );

  return (
    <ArticleContext.Provider
      value={{
        getFigureNumber,
        registerFigure,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
}
