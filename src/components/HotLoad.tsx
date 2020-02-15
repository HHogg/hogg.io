import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import Root from './Root';

const HotLoad = () => {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
};

export default hot(module)(HotLoad);
