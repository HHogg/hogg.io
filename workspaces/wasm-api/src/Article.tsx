import {
  ArticleFigCodeBlock,
  ArticleFigLink,
  ArticleFigs,
  ArticlePage,
} from '@hogg/common';
import {
  ArticleHeading,
  ArticleParagraph,
  ArticleSection,
  BulletPoint,
  BulletPoints,
  Code,
  Link,
} from 'preshape';

type Props = {};

const Article = ({}: Props) => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>
        <ArticleParagraph>
          This isn't an article about how great Rust is. This is an article
          about my end to end workflow of using Rust in a monorepo for my web
          projects.
        </ArticleParagraph>

        <ArticleParagraph>
          I've been using Rust for about 1 and a half years now and I'm mostly
          happy with the setup, which involves:
        </ArticleParagraph>

        <BulletPoints>
          <BulletPoint>
            Writing Rust in a pretty standard way with standard tooling.
          </BulletPoint>

          <BulletPoint>
            A mono repo with a variety of Rust, WebAssembly and TypeScript
            libraries, Rust CLIs and React WebApps.
          </BulletPoint>

          <BulletPoint>
            A fully typed integration between Rust, WebAssembly and TypeScript.
          </BulletPoint>

          <BulletPoint>
            Live/HMR reloading of WebAssembly and TypeScript in development when
            files change.
          </BulletPoint>
        </BulletPoints>

        {/* <ArticleParagraph>
          At the heart of this workflow are these two tools,{' '}
          <Link underline>wasm-bindgen</Link> and{' '}
          <Link underline>wasm-pack</Link>. Both of these tools have great
          documentation so I won't go into too much detail here, but I'll give a
          brief overview.
        </ArticleParagraph> */}
      </ArticleSection>

      {/* https://github.com/rustwasm/wasm-bindgen */}
      {/* https://github.com/rustwasm/wasm-pack */}

      <ArticleSection>
        <ArticleHeading>wasm-bindgen</ArticleHeading>

        <ArticleParagraph>
          <Link underline>wasm-bindgen</Link> is a tool that facilitates
          communication between WebAssembly and JavaScript. It generates
          JavaScript code that can be used to interact with WebAssembly modules.
          For example, it provides an <Code>init</Code> function that can be
          used to fetch the Wasm module and instantiate it using the{' '}
          <Link
            href="https://developer.mozilla.org/en-US/docs/WebAssembly"
            underline
            target="_blank"
          >
            WebAssembly JavaScript API (MDN)
          </Link>
          . It also handles the conversion of JavaScript types to WebAssembly
          types and vice versa.
        </ArticleParagraph>

        <ArticleParagraph>
          Let's start at the Rust side of things, how we set that up and some
          general principles I've taken to not let all the Wasm stuff leak into
          the rest of the codebase.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="rust-example"
            description="Rust code that defines a Sequence type as a fixed length array of length 12, and a function that returns the length of the sequence."
            language="rust"
          >{`
pub type Sequence = [u8; 12];

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
          `}</ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          The code in <ArticleFigLink fig="rust-example" /> is standard Rust
          code, there's nothing Wasmy about it, you could imagine this living in
          a file called <Code>sequence.rs</Code> somewhere, and if this is a
          Rust library then it could be part of the public API and exposed in
          the
          <Code>lib.rs</Code> file.
        </ArticleParagraph>

        <ArticleParagraph>
          Let's now make this available for the web by creating a new file
          within the same project called <Code>wasm_api.rs</Code> (this could be
          called anything) and adding the following contents:
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="wasm-api"
            description="Rust code that exports the Sequence type and get_length function to JavaScript."
            language="rust"
          >
            {`
use wasm_bindgen::prelude::*;

use super::sequence::{ get_length as _get_length };

#[wasm_bindgen]
pub fn get_length(sequence: &JsValue) -> Result<usize, JsError> {
  Ok(_get_length(&serde_wasm_bindgen::from_value::<
    Sequence,
  >(sequence.to_owned())?))
}`}
          </ArticleFigCodeBlock>
        </ArticleFigs>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
