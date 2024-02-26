import { ProjectWindow } from '@hogg/common';
import Renderer from './Renderer/Renderer';
import RendererProvider from './Renderer/RendererProvider';
import WasmApi from './WasmApi/WasmApi';

export default function Presentation() {
  return (
    <WasmApi>
      <RendererProvider
        sequences={[
          [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
          [12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]}
      >
        <ProjectWindow>
          <Renderer />
        </ProjectWindow>
      </RendererProvider>
    </WasmApi>
  );
}
