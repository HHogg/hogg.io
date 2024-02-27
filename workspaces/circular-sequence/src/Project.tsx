import { ProjectPage, ProjectPageProps } from '@hogg/common';
import Article from './Article';
import WasmApi from './Article/WasmApi/WasmApi';

export default function Project(props: ProjectPageProps) {
  return (
    <WasmApi>
      <ProjectPage {...props} article={<Article />} />
    </WasmApi>
  );
}
