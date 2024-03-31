import { ProjectPage, ProjectPageProps } from '@hogg/common';
import Article from './Article';
import Presentation from './Presentation';
import LineSegmentProvider from './Presentation/LineSegmentProvider';
import WasmApi from './Presentation/WasmApi/WasmApi';

export default function Project(props: ProjectPageProps) {
  return (
    <WasmApi>
      <LineSegmentProvider>
        <ProjectPage
          {...props}
          article={<Article />}
          presentation={<Presentation />}
        />
      </LineSegmentProvider>
    </WasmApi>
  );
}
