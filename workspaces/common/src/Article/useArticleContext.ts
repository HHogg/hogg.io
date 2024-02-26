import { RefObject, createContext, useContext, useEffect } from 'react';

export type ArticleContextProps = {
  getFigureNumber: (ref: RefObject<HTMLElement>) => number;
  registerFigure: (ref: RefObject<HTMLElement>) => void;
};

export const ArticleContext = createContext<ArticleContextProps>({
  getFigureNumber: () => 0,
  registerFigure: () => () => {},
});

function useArticleContext() {
  return useContext(ArticleContext);
}

export function useArticleFigNumber(ref: RefObject<HTMLElement>): number {
  const { registerFigure, getFigureNumber } = useArticleContext();

  useEffect(() => registerFigure(ref), [ref, registerFigure]);

  return getFigureNumber(ref);
}
