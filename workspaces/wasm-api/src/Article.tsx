import {
  ArticleFigCodeBlock,
  ArticleFigLink,
  ArticleFigs,
  ArticleHeading,
  ArticlePage,
  ArticleParagraph,
  ArticleSection,
} from '@hogg/common';
import { Code, Link } from 'preshape';

type Props = {};

const Article = ({}: Props) => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>
        <ArticleParagraph>
          I'm a cliche and I've started using Rust but this isn't an article
          about how great it is. This is an article about how I've been using
          Rust in my web projects, the workflow to compile Rust to WebAssembly,
          and the setup for loading and using the compiled WebAssembly in a
          React app.
        </ArticleParagraph>

        <ArticleParagraph>
          At the heart of this workflow are these two tools,{' '}
          <Link underline>wasm-bindgen</Link> and{' '}
          <Link underline>wasm-pack</Link>. Both of these tools have great
          documentation so I won't go into too much detail here, but I'll give a
          brief overview.
        </ArticleParagraph>
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

        <ArticleFigs theme="night">
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

        <ArticleFigs theme="night">
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
