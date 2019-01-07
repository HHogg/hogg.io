import React, { Component } from 'react';
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';
import remarkableReactReadme from 'remarkable-react/README.md';
import {
  Base,
  CodeBlock,
  Flex,
  Markdown,
  Responsive,
  Tab,
  Tabs,
  TabContent,
  Text,
  TextArea,
} from 'preshape';
import { widthMedium, widthSmall } from '../../Root';
import renderReactJsonString from './renderReactJsonString';
import Project from '../../Project/Project';
import ReadMe from '../../ReadMe/ReadMe';

const remarkable = new Remarkable();
const renderer = new RemarkableReactRenderer();
const renderMarkdown = remarkable.render.bind(remarkable);

remarkable.renderer = renderer;

export default class RemarkableReact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 'html',
      markdown: `# Lorem ipsum dolor sit amet

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ut dolor risus. Pellentesque luctus, elit vitae molestie molestie, felis massa varius tortor, ac pellentesque odio sapien ac enim.

## Lorem ipsum dolor sit amet

Phasellus gravida ante eu lectus rutrum, faucibus [laoreet nunc sagittis](https://hogg.io/ "Hogg.io"). Pellentesque ac cursus lorem, non ullamcorper mi. Donec luctus tellus vitae mattis blandit. Sed molestie augue non velit ornare facilisis. [Curabitur consectetur dolor ac nisi varius accumsan](https://hogg.io/ "Hogg.io").

### Lorem ipsum dolor sit amet

~~Sed pharetra sollicitudin magna id laoreet~~. **Nam dui ligula**, vulputate eu posuere ut, _vulputate interdum_ justo. Aliquam erat volutpat. Phasellus vestibulum porta urna, vel commodo dolor ___lacinia___ et.

| Header Cell 1 | Header Cell 2 | Header Cell 3 |
| -- | -- | -- |
| Row 1 Cell 1 | Row 1 Cell 2 | Row 1 Cell 3 |
| Row 2 Cell 1 | Row 2 Cell 2 | Row 2 Cell 3 |


### Ordered List

1. List Item 1
1. List Item 2
1. List Item 3

### Unordered List

* List Item 1
* List Item 2
* List Item 3

### Highlighted Code

\`\`\`jsx
import React, { Component } from 'react';

export default class Lorem extends Component {
  render() {
    return (
      <p>Hello</p>
    );
  }
}
\`\`\`
`,
    };
  }

  handleChange(event) {
    this.setState({ markdown: event.target.value });
  }

  render() {
    const { active, markdown } = this.state;

    return (
      <Project { ...this.props } maxWidth={ widthMedium }>
        <Base>
          <Responsive queries={ [widthSmall, widthMedium] }>
            { (match) => (
              <Flex
                  direction="vertical"
                  grow
                  gutter="x6"
                  margin="x16">
                <Flex
                    direction={ match(widthSmall) ? 'horizontal' : 'vertical' }
                    grow
                    gutter="x6">
                  <Flex
                      direction="horizontal"
                      grow
                      initial={ match(widthSmall) ? 'none' : null }>
                    <TextArea
                        backgroundColor
                        borderSize="x2"
                        color
                        label="Editor"
                        onChange={ (event) => this.handleChange(event) }
                        paddingHorizontal="x6"
                        paddingVertical="x3"
                        rows="30"
                        value={ markdown } />
                  </Flex>

                  <Flex
                      direction="vertical"
                      grow
                      initial={ match(widthSmall) ? 'none' : null }>
                    <Tabs>
                      <Tab
                          active={ active === 'html' }
                          onClick={ () => this.setState({ active: 'html' }) }>
                        HTML Output
                      </Tab>

                      <Tab
                          active={ active === 'react' }
                          onClick={ () => this.setState({ active: 'react' }) }>
                        React Output
                      </Tab>
                    </Tabs>

                    <TabContent
                        grow
                        height="40rem"
                        paddingHorizontal="x6"
                        paddingVertical="x3"
                        scrollable>
                      { active === 'html' && (
                        <Text Component="div" size="x1">
                          <Markdown>
                            { markdown }
                          </Markdown>
                        </Text>
                      ) }

                      { active === 'react' && (
                        <CodeBlock language="json" size="x1" wrap>
                          { renderReactJsonString(renderMarkdown(markdown)) }
                        </CodeBlock>
                      ) }
                    </TabContent>
                  </Flex>
                </Flex>
              </Flex>
            ) }
          </Responsive>

          <ReadMe margin="x16">
            { remarkableReactReadme }
          </ReadMe>
        </Base>
      </Project>
    );
  }
}
