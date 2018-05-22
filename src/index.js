import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './components/Root';

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <BrowserRouter>
        <Component />
      </BrowserRouter>
    </AppContainer>,
  document.getElementById('Root'));
};

if (module.hot) {
  module.hot.accept('./components/Root', () => render(Root));
}

render(Root);
