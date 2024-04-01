import {
  ArticleFig,
  ArticleFigCodeBlock,
  ArticleFigLink,
  ArticleFigs,
  ArticlePage,
  ProjectPageLink,
} from '@hogg/common';
import {
  TilingArrangementProvider,
  ColorMode,
  TilingNotationProvider,
  TilingRenderer,
  meta as tilingsMeta,
} from '@hogg/tilings';
import {
  ArticleHeading,
  ArticleParagraph,
  ArticleSection,
  Code,
  Link,
  Text,
  sizeX12Px,
} from 'preshape';
import fileContentsGetMatch from '@hogg/circular-sequence/src-rust/get_match.rs?raw';
import fileContentsMinPermutation from '@hogg/circular-sequence/src-rust/min_permutation.rs?raw';
import fileContentsSequence from '@hogg/circular-sequence/src-rust/sequence.rs?raw';
import ConcatenatedSequencesFig from './Figs/ConcatenatedSequencesFig';
import MinPermutationFigWithWasApi from './Figs/MinPermutationFig';

const Article = () => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>
          While working on my <ProjectPageLink project={tilingsMeta} /> project,
          I was needing to build up a list of distinct shape arrangements (
          <ArticleFigLink fig="dodecagon-shape-arrangement" />
          ). This of course needed a way to check an arrangement against a list
          of previously seen arrangements.
        </ArticleParagraph>

        <ArticleParagraph>
          The complexity and interesting part of this problem came from the fact
          that the shapes could be arranged in a circular fashion, and there was
          no defined start or end point. This meant that the same arrangement
          could be represented in multiple ways. I was also dealing with an
          infinite amount of these arrangements, and 100,000s of them every
          second.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="dodecagon-shape-arrangement"
            description="Shape arrangement of a dodecagon at the center, with alternating triangles, squares and hexagons on it's edges."
          >
            <TilingArrangementProvider>
              <TilingNotationProvider notation="12-3,4,6,4,3,4,6,4,3,4,6,4">
                <TilingRenderer
                  height="200px"
                  options={{
                    colorMode: ColorMode.None,
                  }}
                />
              </TilingNotationProvider>
            </TilingArrangementProvider>
          </ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Arrangements as sequences</ArticleHeading>

        <ArticleParagraph>
          The intuitive way to start comparing these shape arrangements is going
          to be representing them as some sort of sequence , so given the shape
          arrangement from <ArticleFigLink fig="dodecagon-shape-arrangement" />,
          we can represent this using Rust's fixed length arrays (
          <ArticleFigLink fig="example-sequences" />
          ).
        </ArticleParagraph>

        <ArticleParagraph>
          The fixed length arrays were chosen because as stated above the
          program was processing a lot of these sequences, and they are more
          performant than other options. The Rust book has a great section on
          this -{' '}
          <Link
            href="https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html?highlight=stack#the-stack-and-the-heap"
            target="_blank"
            underline
          >
            "The Stack and the Heap"
          </Link>
          , but the short explanation is that known spaces on the stack are
          already available for memory allocation, whereas for unknown sized
          things (like vectors) require an allocator to search the heap for
          available space, which makes it slower. We want to limit use of the
          heap and use the stack where possible.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="example-sequences"
            description="A couple of example sequences represented as Rust fixed length arrays. "
            language="rust"
          >
            {`
// Regular polygon tilings are limited to 3, 4, 6, 8
// and 12 sided shapes so I'll use 12 here as an upper
// sequence limit, but this could be extended to whatever.
type Sequence = [u8; 12];

// A dodecagon sequence
let seq_1: Sequence = [3, 4, 6, 4, 3, 4, 6, 4, 3, 4, 6, 4];

// A triangle sequence
let seq_2: Sequence = [6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            `}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          The sequences are simply a list of numbers that represent the shapes
          around the center shape, in this case a dodecagon. The numbers
          represent the number of sides on the shape, so a 3 represents a
          triangle and a 4 represents a square. The start point in these
          sequences is irrelevant at the moment
        </ArticleParagraph>

        <ArticleParagraph>
          A 0 represents an empty space, and in this case, the dodecagon has 12
          sides so the sequence is of length 12. The one downside of using a
          fixed length array is that we'll need a simple utility function to get
          the actual length of the sequence for a lot of the operations we'll be
          doing (<ArticleFigLink fig="get-length" />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="get-length"
            description="Implementation to return the actual length of a sequence"
            language="rust"
            startLineNumber={7}
            endLineNumber={23}
          >
            {fileContentsSequence}
          </ArticleFigCodeBlock>
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
          If we take the sequence <Code>[3, 4, 3, 12]</Code> (
          <ArticleFigLink fig="sequence-34312" />) , we can iterate through the
          starting point and which ever direction we traverse we produce these
          same set of paths.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="sequence-34312"
            description="A symmetrical sequence, the same traversal is produced regardless of the direction."
            presentation={
              <TilingArrangementProvider>
                <TilingNotationProvider notation="4-3,4,3,12">
                  <TilingRenderer
                    height="200px"
                    validations={[]}
                    options={{
                      colorMode: ColorMode.None,
                      padding: sizeX12Px,
                    }}
                  />
                </TilingNotationProvider>
              </TilingArrangementProvider>
            }
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
          <Code>[3, 3, 4, 12]</Code> (<ArticleFigLink fig="sequence-33412" />)
          and do the same thing, then we get different traversal results when we
          traverse in both directions.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="sequence-33412"
            description="An asymmetrical sequence, and it's differing traversals in either direction"
            presentation={
              <TilingArrangementProvider>
                <TilingNotationProvider notation="4-3,3,4,12">
                  <TilingRenderer
                    height="200px"
                    validations={[]}
                    options={{
                      colorMode: ColorMode.None,
                      padding: sizeX12Px,
                      isValid: true,
                    }}
                  />
                </TilingNotationProvider>
              </TilingArrangementProvider>
            }
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
          It's fairly simple to check if a sequence is symmetrical. We can
          simply concatenate the sequence and check for the inverted sequence
          within itself (<ArticleFigLink fig="concatenated-sequence" />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ConcatenatedSequencesFig />
        </ArticleFigs>

        <ArticleParagraph>
          This <Code>get_symmetry_index</Code> function (
          <ArticleFigLink fig="is-symmetrical" />) is going to give us a way to
          check which sequences we need to run any reverse functions on, in{' '}
          <Code>O(n)</Code> time.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="is-symmetrical"
            description="Implementation to retrieve the starting index of the reverse sequence if it exists"
            language="rust"
            startLineNumber={25}
            endLineNumber={61}
          >
            {fileContentsSequence}
          </ArticleFigCodeBlock>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Matches and partial matches</ArticleHeading>

        <ArticleParagraph>
          The next step is now to try and match up a sequence with another from
          a list of sequences.
        </ArticleParagraph>

        <ArticleParagraph>
          Outside the context of the <ProjectPageLink project={tilingsMeta} />{' '}
          project, we could keep ourselves concerned only with complete matches,
          however for my purpose I also needed to identify partial matches so
          there will be a little bit of extra logic to handle this.
        </ArticleParagraph>

        <ArticleParagraph>
          The way I achieved this was to iterate through the collection of
          sequences, as soon as there is a full match immediately return it,
          otherwise the first partial match we keep note of and continue to
          iterate through the rest of the sequences, returning the first partial
          match at the end (<ArticleFigLink fig="get-match" />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="get-match"
            description="Implementation to search through the sequences"
            language="rust"
            startLineNumber={9}
            endLineNumber={47}
          >
            {fileContentsGetMatch}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          Our comparing logic for two sequences is going to be somewhat similar
          to the symmetrical check. We're going to concatenate the sequence with
          itself and then check for the target sequence within the concatenated
          sequence, forwards and backwards (when asymmetrical) (
          <ArticleFigLink fig="compare-sequences" />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="compare-sequences"
            description="Implementation to search through the sequences"
            language="rust"
            startLineNumber={49}
          >
            {fileContentsGetMatch}
          </ArticleFigCodeBlock>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Normalizing sequences</ArticleHeading>

        <ArticleParagraph>
          We now have a way to compare sequences to build up a distinct
          collection, however depending on what sequence we start with, we could
          end up with a collection that{' '}
          <Text emphasis tag="em">
            looks
          </Text>{' '}
          different. It might pass our comparison logic, but when outputted to a
          UI for debugging purposes, it could be confusing to see the same
          arrangement in different forms. It'll be useful to have a way to
          normalize the sequences so that they are all in the same form.
        </ArticleParagraph>

        <ArticleParagraph>
          The logic we pick here isn't particularly important, as long as it's
          consistent. I chose to normalize them by finding the smallest
          permutation of the sequence, whether it's forwards or backwards
          (another use for the symmetrical checking). By "smallest permutation"
          I mean, if we were to join the sequence into a single continuous
          number we can easily compare 2 sequences to find the smallest/largest
          of the 2.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="normalize-sequence"
            description="Implementation to search through the sequences"
            language="rust"
            startLineNumber={8}
          >
            {fileContentsMinPermutation}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>Let's take a look at some examples.</ArticleParagraph>

        <ArticleFigs>
          <MinPermutationFigWithWasApi />
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Summary</ArticleHeading>

        <ArticleParagraph>
          There's a sequences of numbers that can have a cyclic property to them
          and this poses a problem when trying to compare them because there's
          no defied start and endpoint. We solved this by essentially
          duplicating the sequence and then checking for the target sequence
          within the duplicated sequence. We also covered the symmetrical
          property of the sequence and how we can use this to our advantage to
          find the starting index of the reverse sequence if it exists.
        </ArticleParagraph>

        <ArticleParagraph>
          With that done, I can now continue with the rest of the other project.
        </ArticleParagraph>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
