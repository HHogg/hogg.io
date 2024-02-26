import { ProjectPage, ProjectPageProps } from '@hogg/common';
import { useState } from 'react';
import Article from './Article';
import Presentation from './Presentation';
import configurations from './Presentation/configurations';

export default function Project(props: ProjectPageProps) {
  const [data, setData] = useState(configurations[0]);

  return (
    <ProjectPage
      {...props}
      article={<Article />}
      presentation={<Presentation data={data.config} onSelect={setData} />}
    />
  );
}
