import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import Root from './components/Root';

if (process.env.NODE_ENV === 'development') {
  createRoot(document.getElementById('Root') as HTMLElement).render(
    <StrictMode>
      <BrowserRouter>
        <HelmetProvider>
          <Root />
        </HelmetProvider>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  hydrateRoot(
    document.getElementById('Root')!,
    <BrowserRouter>
      <HelmetProvider>
        <Root />
      </HelmetProvider>
    </BrowserRouter>
  );
}
