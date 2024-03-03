import {
  ArticleFig,
  ArticleFigCodeBlock,
  ArticleFigs,
  ArticleHeading,
  ArticlePage,
  ArticleParagraph,
  ArticleSection,
  ProjectPageLink,
} from '@hogg/common';
import {
  ArrangementProvider,
  ColorMode,
  NotationProvider,
  Renderer,
  meta as tilingsMeta,
} from '@hogg/tilings';
import { Code, Link } from 'preshape';
import { useState } from 'react';

type Props = {};

const Article = ({}: Props) => {
  const [figExampleDodecagon, setFigExampleDodecagon] = useState(0);
  const [figExampleSequences, setFigExampleSequences] = useState(0);
  const [figExampleCircularSequences, setFigExampleCircularSequences] =
    useState(0);
  const [figSequence34312, setFigSequence34312] = useState(0);
  const [figResults34312, setFigResults34312] = useState(0);
  const [figSequence33412, setFigSequence33412] = useState(0);
  const [figResults33412, setFigResults33412] = useState(0);
  const [figGetLength, setFigGetLength] = useState(0);
  const [figIsSymmetrical, setFigIsSymmetrical] = useState(0);

  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>
          While working on my <ProjectPageLink project={tilingsMeta} /> project,
          I came across a problem where I needed to match the arrangements of
          shapes around another shape (Fig {figExampleDodecagon}), to a
          collection of previously matched completed arrangements (shapes that
          had all their sides occupied). The reason being to build up a list of
          distinct shape arrangements.
        </ArticleParagraph>

        <ArticleParagraph>
          The complexity came from comparing the arrangements when they had no
          defined start and end point, and handling cases where the sequence of
          shapes produced the same arrangement, but in the opposite direction.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            description="Shape arrangement of a dodecagon at the center, with alternating triangles and squares on it's edges."
            onNumberChange={setFigExampleDodecagon}
          >
            <ArrangementProvider>
              <NotationProvider notation="12-3,4,3,4,3,4,3,4,3,4,3,4">
                <Renderer
                  height="200px"
                  options={{
                    colorMode: ColorMode.None,
                  }}
                />
              </NotationProvider>
            </ArrangementProvider>
          </ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>As sequences</ArticleHeading>

        <ArticleParagraph>
          The easiest way to start matching and comparing these shape
          arrangements is going to be in sequence form, so given the shape
          arrangement from Fig. {figExampleDodecagon}, we can represent this
          using Rust's fixed length arrays (Fig. {figExampleSequences}).
        </ArticleParagraph>

        <ArticleParagraph>
          The fixed length arrays here were chosen because my searching and
          validation program that I was building was dealing with billions of
          sequences and the fixed length arrays are allocated to the stack and
          not the heap. MIT has a great article on this -{' '}
          <Link
            href="https://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/the-stack-and-the-heap.html"
            target="_blank"
            underline
          >
            "The Stack and the Heap"
          </Link>
          , but the short of it is that the stack allocations are already
          available whereas the heap the allocator first has to search for
          available space, which makes it slower. We want to limit use of the
          heap and use the stack where possible.
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFigCodeBlock
            description="A couple of example sequences represented as Rust fixed length arrays. "
            onNumberChange={setFigExampleSequences}
            language="rust"
          >
            {`
// Regular polygon tilings are limited to 3, 4, 6, 8 
// and 12 sided shapes so I'll use 12 here as an upper
// sequence limit, but this could be extended to whatever
type Sequence = [u8; 12];

// A dodecagon sequence
let seq_1: Sequence = [3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4];

// A triangle sequence
let seq_2: Sequence = [6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            `}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          The sequences are simply a list of numbers that represent the shapes
          around the center shape, in this case a dodecagon. The numbers
          represent the number of sides on the shape, so a 3 represents a
          triangle and a 4 represents a square.
        </ArticleParagraph>

        <ArticleParagraph>
          A 0 represents an empty space, and in this case, the dodecagon has 12
          sides so the sequence is of length 12. The one downside of using a
          fixed length array is that we'll need a simple utility function to get
          the actual length of the sequence for a lot of the operations we'll be
          doing (Fig. {figGetLength}).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            language="rust"
            description="A function that returns the actual length of a sequence"
            onNumberChange={setFigGetLength}
          >
            {`
pub fn get_length(sequence: &Sequence) -> usize {
  let mut length = 0;

  for value in sequence {
    if *value == 0 {
      return length;
    }

    length = length + 1;
  }

  length
}
                `}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          The start point in these sequences is irrelevant at the moment, and a
          way that's more helpful is to visualize them in circle form with no
          fixed start and end point (Fig. {figExampleCircularSequences}).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            description="Representation of a circular sequence in a circular form."
            onNumberChange={setFigExampleCircularSequences}
          ></ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Symmetrical sequences</ArticleHeading>

        <ArticleParagraph>
          A property that's not indicated by the sequences shown above is what
          direction around the shape arrangement did we go to build up the
          sequence? Does it matter?
        </ArticleParagraph>

        <ArticleParagraph>
          It may seem at first that all sequences when traversed in either
          direction would yield the same result but it's a specific property
          depending on the contents of the sequence. Let's take a look at some
          examples.
        </ArticleParagraph>

        <ArticleParagraph>
          If we take the sequence <Code>[3, 4, 3, 12]</Code> (Fig.{' '}
          {figSequence34312}
          ), we can iterate through the starting point and what ever direction
          we traverse we produce these same set of paths (Fig. {figResults34312}
          ).
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFig
            description="Circular representation of 3, 4, 3, 12"
            onNumberChange={setFigSequence34312}
          ></ArticleFig>

          <ArticleFigCodeBlock
            description="A couple of example sequences represented as Rust fixed length arrays. "
            onNumberChange={setFigResults34312}
            language="rust"
          >
            {`
// Anti/Clockwise
[3, 4, 3, 12]
[4, 3, 12, 3]
[3, 12, 3, 4]
[12, 3, 4, 3]
            `}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          However if we take a very similar sequence of{' '}
          <Code>[3, 3, 4, 12]</Code> (Fig. {figSequence33412}) and do the same
          thing, then we get different traversal results when we traverse in
          both directions (Fig. {figResults33412}).
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFig
            description="Circular representation of 3, 3, 4, 12"
            onNumberChange={setFigSequence33412}
          ></ArticleFig>

          <ArticleFigCodeBlock
            description="Differing sequences from traversing both directions"
            onNumberChange={setFigResults33412}
            language="rust"
          >
            {`
// Clockwise
[3, 3, 4, 12]
[3, 4, 12, 3]
[4, 12, 3, 3]
[12, 3, 3, 4]

// Anticlockwise
[12, 4, 3, 3]
[3, 12, 4, 3]
[3, 3, 12, 4]
[4, 3, 3, 12]
`}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          We can say the first sequence of <Code>[3, 4, 3, 12]</Code> is
          symmetrical and the second sequence of <Code>[3, 3, 4, 12]</Code> is
          asymmetrical.
        </ArticleParagraph>

        <ArticleParagraph>
          This is important (at least it is for the shape arrangements example)
          because arrangements that are asymmetrical sequences are still the
          same arrangement, just in a different direction and should not be
          counted as distinct arrangements.
        </ArticleParagraph>

        <ArticleParagraph>
          It's fairly simple to check if a sequence is symmetrical without
          producing all of the paths and checking them against each other as
          that would be costly. We can simply concatenate the sequence and check
          for the inverted sequence within it.
        </ArticleParagraph>

        <ArticleParagraph>
          This <Code>is_symmetrical</Code> utility function (Fig.{' '}
          {figIsSymmetrical}) is going to give us a way to conditionally run any
          comparison logic on the reversed sequence. If a sequence is
          symmetrical, then we can skip running any comparison logic a second
          time on a reversed sequence.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            language="rust"
            description="Implementation to check for symmetrical sequences"
            onNumberChange={setFigIsSymmetrical}
          >
            {`
fn is_symmetrical(sequence: &Sequence) -> bool {
  let length = get_length(sequence);
  let mut i = 0;

  for _ in 0..2 {
    for j in 0..length {
      if sequence[j] == sequence[length - 1 - i] {
        if i == length - 1 {
          return true;
        }

        i = i + 1;
      } else {
        i = 0;
      }
    }
  }

  false
}
          `}
          </ArticleFigCodeBlock>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Matches and partial matches</ArticleHeading>

        <ArticleParagraph>
          The next step is now to take a sequence and compare it to a collection
          of previously matched sequences to see if it's a new arrangement or
          not.
        </ArticleParagraph>

        <ArticleParagraph>
          Outside of the context of the{' '}
          <ProjectPageLink project={tilingsMeta} /> project it could be isolated
          to finding complete matches like we did with the{' '}
          <Code>is_symmetrical</Code> utility function (Fig. {figIsSymmetrical}
          ), however I also needed a way to identify partial matches, so we'll
          take a look at both.
        </ArticleParagraph>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
