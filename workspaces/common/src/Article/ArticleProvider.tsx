import { PropsWithChildren, useCallback, useState } from 'react';
import { ArticleContext, ArticleContextProps } from './useArticleContext';

export default function ArticleProvider({ children }: PropsWithChildren) {
  const [figures, setFigures] = useState<
    {
      element: HTMLElement;
      id: string;
      rect: DOMRect;
    }[]
  >([]);

  const insertIntoFigures = useCallback((id: string, element: HTMLElement) => {
    setFigures((figures) => {
      const nextFigures: typeof figures = [
        ...figures,
        { element, id, rect: element.getBoundingClientRect() },
      ];

      nextFigures.sort(
        (a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left
      );

      return nextFigures;
    });
  }, []);

  const removeFromFigures = useCallback((id: string) => {
    setFigures((figures) => figures.filter((fig) => fig.id !== id));
  }, []);

  const registerFigure: ArticleContextProps['registerFigure'] = useCallback(
    (id, ref) => {
      if (ref.current !== null) {
        insertIntoFigures(id, ref.current);
      }
      return () => {
        if (ref.current !== null) {
          removeFromFigures(id);
        }
      };
    },
    [insertIntoFigures, removeFromFigures]
  );

  const getFigureNumber: ArticleContextProps['getFigureNumber'] = useCallback(
    (id) => {
      const index = figures.findIndex((fig) => fig.id === id);

      if (index === -1) {
        return null;
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
