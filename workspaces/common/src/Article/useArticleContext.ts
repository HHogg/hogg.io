import { RefObject, createContext, useContext, useEffect } from 'react';

export type ArticleContextProps = {
  getFigureNumber: (id: string) => number | null;
  registerFigure: (id: string, ref: RefObject<HTMLElement>) => void;
};

export const ArticleContext = createContext<ArticleContextProps>({
  getFigureNumber: () => 0,
  registerFigure: () => () => {},
});

export function useArticleContext() {
  return useContext(ArticleContext);
}

export function useArticleFigNumber(
  id: string,
  ref: RefObject<HTMLElement>
): number | null {
  const { registerFigure, getFigureNumber } = useArticleContext();

  useEffect(() => registerFigure(id, ref), [id, ref, registerFigure]);

  return getFigureNumber(id);
}
