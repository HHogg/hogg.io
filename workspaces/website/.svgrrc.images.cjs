module.exports = {
  prettier: true,
  typescript: true,
  indexTemplate: () => '',
  replaceAttrValues: {
    '#000000': 'var(--color-text-shade-1)',
    '#000001': 'var(--color-text-shade-2)',
    '#000002': 'var(--color-text-shade-3)',
    '#5C7CFA': 'var(--color-accent-shade-3)',
    '#4C6EF5': 'var(--color-accent-shade-4)',
    '#4263EB': 'var(--color-accent-shade-5)',
    '#FFFFFF': 'var(--color-background-shade-1)',
    '#FFFFFE': 'var(--color-background-shade-2)',
    '#FFFFFD': 'var(--color-background-shade-3)',
  },

  template: (variables, { tpl }) => {
    return tpl`
      ${variables.imports.slice(1)}
      import './SvgImage.css';

      ${variables.interfaces}

      const ${variables.componentName} = (${variables.props}) => (
        ${variables.jsx}
      );

      ${variables.exports};
    `;
  },
  svgoConfig: {
    plugins: [
      {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [
            {
              className: 'SvgImage',
            },
          ],
        },
      },
    ],
  },
};
