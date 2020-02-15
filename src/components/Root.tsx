import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TypeTheme } from 'preshape';
import Site from './Site';
import Metas from './Metas/Metas';

export const RootContext = React.createContext<{
  onChangeTheme: (theme: TypeTheme) => void;
  theme: TypeTheme;
}>({
  onChangeTheme: () => undefined,
  theme: 'day',
});

export default () => {
  const [theme, onChangeTheme] = React.useState<TypeTheme>('day');

  return (
    <BrowserRouter>
      <RootContext.Provider value={ { onChangeTheme, theme } }>
        <Metas description="My personal projects and experience." />
        <Site />
      </RootContext.Provider>
    </BrowserRouter>
  );
};
