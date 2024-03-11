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
import ArticleFigLink from '@hogg/common/src/Article/ArticleFigLink';
import {
  ArrangementProvider,
  ColorMode,
  NotationProvider,
  Renderer,
  meta as tilingsMeta,
} from '@hogg/tilings';
import { Code, Link, sizeX12Px } from 'preshape';
import { useState } from 'react';
import SequenceView from './SequenceView/SequenceView';
import { Sequence } from './WasmApi/useWasmApi';

type Props = {};

const symmetricSequence: Sequence = [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0];
const asymmetricSequence: Sequence = [3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0];

const Article = ({}: Props) => {
  const [figExampleDodecagon, setFigExampleDodecagon] = useState(0);
  const [figExampleSequences, setFigExampleSequences] = useState(0);
  const [figSequence34312, setFigSequence34312] = useState(0);
  const [figSequence33412, setFigSequence33412] = useState(0);
  const [figGetLength, setFigGetLength] = useState(0);
  const [figIsSymmetrical, setFigIsSymmetrical] = useState(0);
  const [figConcatenatedSequence, setFigConcatenatedSequence] = useState(0);

  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>
          While working on my <ProjectPageLink project={tilingsMeta} /> project,
          I was needing to build up a list of distinct shape arrangements (
          <ArticleFigLink fig={figExampleDodecagon} />
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
            description="Shape arrangement of a dodecagon at the center, with alternating triangles, squares and hexagons on it's edges."
            onNumberChange={setFigExampleDodecagon}
          >
            <ArrangementProvider>
              <NotationProvider notation="12-3,4,6,4,3,4,6,4,3,4,6,4">
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
        <ArticleHeading>Arrangements as sequences</ArticleHeading>

        <ArticleParagraph>
          The intuitive way to start comparing these shape arrangements is going
          to be representing them as some sort of sequence , so given the shape
          arrangement from <ArticleFigLink fig={figExampleDodecagon} />, we can
          represent this using Rust's fixed length arrays (
          <ArticleFigLink fig={figExampleSequences} />
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

        <ArticleFigs theme="night">
          <ArticleFigCodeBlock
            description="A couple of example sequences represented as Rust fixed length arrays. "
            onNumberChange={setFigExampleSequences}
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
          doing (<ArticleFigLink fig={figGetLength} />
          ).
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFigCodeBlock
            language="rust"
            description="A function that returns the actual length of a sequence"
            onNumberChange={setFigGetLength}
          >
            {`
pub fn get_length(sequence: &Sequence) -> usize {
  let mut length = 0;

  for value in sequence {
    // If we find an empty space, we can
    // stop and return the length
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
          <ArticleFigLink fig={figSequence34312} />) , we can iterate through
          the starting point and which ever direction we traverse we produce
          these same set of paths.
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFigCodeBlock
            description="A couple of example sequences represented as Rust fixed length arrays. "
            onNumberChange={setFigSequence34312}
            presentation={
              <ArrangementProvider>
                <NotationProvider notation="4-3,4,3,12">
                  <Renderer
                    height="200px"
                    validations={[]}
                    options={{
                      colorMode: ColorMode.None,
                      padding: sizeX12Px,
                    }}
                  />
                </NotationProvider>
              </ArrangementProvider>
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
          <Code>[3, 3, 4, 12]</Code> (<ArticleFigLink fig={figSequence33412} />)
          and do the same thing, then we get different traversal results when we
          traverse in both directions.
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFigCodeBlock
            description="Differing sequences from traversing both directions"
            onNumberChange={setFigSequence33412}
            presentation={
              <ArrangementProvider>
                <NotationProvider notation="4-3,3,4,12">
                  <Renderer
                    height="200px"
                    validations={[]}
                    options={{
                      colorMode: ColorMode.None,
                      padding: sizeX12Px,
                      isValid: true,
                    }}
                  />
                </NotationProvider>
              </ArrangementProvider>
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
          within itself (<ArticleFigLink fig={figConcatenatedSequence} />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            description="Concatenated symmetrical and asymmetrical sequences"
            flex="vertical"
            gap="x12"
            onNumberChange={setFigConcatenatedSequence}
          >
            <SequenceView sequence={symmetricSequence} />
            <SequenceView sequence={asymmetricSequence} />
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          This <Code>is_symmetrical</Code> utility function (Fig.{' '}
          {figIsSymmetrical}) is going to give us a way to check which sequences
          we need to run any reverse functions on, in <Code>O(n)</Code> time.
        </ArticleParagraph>

        <ArticleFigs theme="night">
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
          match at the end.
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFigCodeBlock
            language="rust"
            description="Implementation to search through the sequences"
          >
            {`
enum Match {
  Exact(Sequence),
  Partial(Sequence),
  None,
}

enum Direction {
  Forward,
  Backward,
}

fn get_match(
  sequence: &Sequence,
  targets: &Vec<Sequence>
) -> Match {
  let mut first_partial_match = Match::None;

  for target in targets.iter() {
    match compare_sequences(sequence, target, Direction::Forward) {
      Match::Exact(sequence) => {
        return Match::Exact(sequence);
      }
      Match::Partial(sequence) => {
        if first_partial_match == Match::None {
          first_partial_match = Match::Partial(sequence);
        }
      }
      _ => {}
    }
  }

  first_partial_match
}

          `}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          Our comparing logic for two sequences is going to be somewhat similar
          to the symmetrical check. We're going to concatenate the sequence with
          itself and then check for the target sequence within the concatenated
          sequence, forwards and backwards (when asymmetrical).
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFigCodeBlock
            language="rust"
            description="Implementation to search through the sequences"
          >
            {`
fn compare_sequences(
  source: &Sequence,
  target: &Sequence,
  direction: Direction
) -> Match {
  let source_length = get_length(source);
  let target_length = get_length(target);

  if source_length > target_length {
    return Match::None;
  }

  let mut i = 0;

  for _ in 0..2 {
    for j in 0..target_length {
      if source[i] == target[j] {
        if i == target_length - 1 {
          return Match::Exact(target.clone());
        }

        if i == source_length - 1 {
          return Match::Partial(target.clone());
        }

        i = i + 1;
      } else if source[0] == target[j] {
        i = 1;
      } else {
        i = 0;
      }
    }
  }

  if direction == Direction::Forward && !is_symmetrical(target) {
    return compare_sequences(&reverse(source), target, Direction::Backward);
  }

  Match::None
}


          `}
          </ArticleFigCodeBlock>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Normalizing to the min permutation</ArticleHeading>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Flattening</ArticleHeading>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
