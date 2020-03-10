import * as React from 'react';
import { hydrate, render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Root from './components/Root';
import './index.css';

const rootElement = document.getElementById('Root');

if (rootElement) {
  if (rootElement.hasChildNodes()) {
    hydrate(
      <BrowserRouter>
        <Root />
      </BrowserRouter>, rootElement);
  } else {
    render(
      <BrowserRouter>
        <Root />
      </BrowserRouter>, rootElement);
  }
}
