import { isValidElement } from 'react';

const renderReactJson = (element) => {
  if (!element) return null;
  if (Array.isArray(element)) return element.map(renderReactJson);
  if (!isValidElement(element)) return element;

  const { type, props: { children, ...props } } = element;
  const json = { type };

  if (Object.keys(props).length) {
    json.props = props;
  }

  if (children && children.length) {
    json.children = renderReactJson(children);
  }

  return json;
};

export default (structure) => JSON
  .stringify(renderReactJson(structure), null, 2)
  .replace(/{/g, 'ReactComponent {');
