import { GeometryRaw, Vec2Raw } from './getGeometry';

const getLinedGeometry = ({ name, elements, vertices }: GeometryRaw) => ({
  name: name,
  vertices: vertices,
  elements: elements?.reduce<Vec2Raw[]>((elements, [a, b, c]) => {
    elements.push([a, b]);
    elements.push([a, c]);
    elements.push([b, c]);
    return elements;
  }, []),
});

export default getLinedGeometry;
