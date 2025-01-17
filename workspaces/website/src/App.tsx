import { MediaContextProvider, getProjectRoutePath } from '@hogg/common';
import { WasmApiProvider } from '@hogg/wasm';
import { ThemeProvider } from 'preshape';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';
import Page404 from './pages/404';
import Landing from './pages/Landing/Landing';
import ProjectPage from './pages/Project/Project';
import TilingGenerationPage from './pages/TilingGenerationPage';
import { projects } from './projects';
import 'preshape/dist/style.css';
import './App.css';

type Props = {
  helmetContext?: any;
};

export default function App({ helmetContext = {} }: Props) {
  return (
    <HelmetProvider context={helmetContext}>
      <ThemeProvider defaultTheme="night" theme="night" disableSystemTheme>
        <MediaContextProvider>
          <WasmApiProvider>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/">
                  <Route index element={<Landing />} />

                  {projects
                    .filter(({ Component }) => Component)
                    .map(({ Component, meta }) => (
                      <Route
                        key={meta.id}
                        path={getProjectRoutePath(meta)}
                        element={
                          <ProjectPage Component={Component!} meta={meta} />
                        }
                      />
                    ))}
                </Route>

                {process.env.NODE_ENV === 'development' && (
                  <Route
                    path="_tiling_generation"
                    element={<TilingGenerationPage />}
                  />
                )}

                <Route path="*" element={<Page404 />} />
              </Routes>
            </Suspense>
          </WasmApiProvider>
        </MediaContextProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
