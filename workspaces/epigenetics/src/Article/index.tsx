import {
  ArticleCallout,
  ArticleFig,
  ArticleFigLink,
  ArticleFigs,
  ArticlePage,
} from '@hogg/common';
import {
  ArticleHeading,
  ArticleParagraph,
  ArticleSection,
  Code,
  Link,
  Text,
} from 'preshape';
import Glossary from './Glossary';

const Article = () => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>
          There are some fantastic evolution simulations I've seen over the
          years.{' '}
          <Link href="https://www.youtube.com/watch?v=N3tRFayqVtk">
            "I programmed some creatures. They Evolved."
          </Link>{' '}
          by{' '}
          <Link href="https://www.youtube.com/@davidrandallmiller">
            davidrandallmiller
          </Link>{' '}
          is a great example. In that video the author shows a simulator which
          uses a small neural network to control the movement of pixels with
          their survival determined by 1. their ending position or 2. if they
          were killed by another pixel.
        </ArticleParagraph>

        <ArticleParagraph>
          There are many more than 2 factors which contribute to the survival of
          a species, so many factors that it's impossible to understand what
          they all are. This got me thinking if it's possible to create a
          simulation where we don't know the laws of the environment and the
          attributes of the species but we can still see the results of
          populations forming and moving.
        </ArticleParagraph>

        <ArticleParagraph>
          This is an article that describes the design of a single entity in
          this simulation, considering the genes, epigenetics and environment
          out to it's descriptive phenotype.
        </ArticleParagraph>

        <ArticleParagraph>
          All of these terms are covered in the glossary below.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Glossary</ArticleHeading>

        <ArticleParagraph>
          There's a lot of terminology which was new to me and I needed a place
          to refresh my memory from time to time. It's useful to read these
          first.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <Glossary />
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Genes and Phenotype</ArticleHeading>

        <ArticleParagraph>
          The phenotype is the name given to the observable characteristics of
          an organism. These traits include physical features like height, eye
          color, blood type, as well as behaviors like aggression and drives.
          These traits are determined by an organism's genetic code (genotype)
          in combination with environmental influences.
        </ArticleParagraph>

        <ArticleParagraph>
          A single gene influencing multiple phenotypic traits is called
          pleiotropy. Each gene can have different degrees of pleiotropy, with
          some having a primary effect on a single trait and others having a
          more widespread effect on many traits.
        </ArticleParagraph>

        <ArticleParagraph>
          A gene can interact with other genes that results in affecting the
          phenotype through activating, suppressing, amplifying or dampening the
          expression of other genes. Known as epistasis.
        </ArticleParagraph>

        <ArticleCallout title="Number of genes">
          Surprisingly, the number of genes in an organism is not directly
          related to its perceived complexity. For example, the human genome
          contains around <Text emphasis>20,000</Text> genes compared to a grape
          that has <Text emphasis>~30,000</Text> and the wheat plant with{' '}
          <Text emphasis>~100,000</Text>. This gives us a good reference point
          when thinking about numbers of genes in this simulation.
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Environment and epigenetics</ArticleHeading>

        <ArticleParagraph>
          Through a number of different chemical reactions on the DNA and
          components related to the protein production process (like histones),
          epigenetic modifications can be made. These modifications, called
          epigenetic markers, do not change the DNA sequence itself but sit on
          top of it and can be used to modify gene expression.
        </ArticleParagraph>

        <ArticleParagraph>
          The effect and existence of all epigenetic markers can change over
          time. Their effects can be continuous and dynamic, suppressive or
          activating. They can also be discrete acting like a switch, turning on
          or off gene expression.
        </ArticleParagraph>

        <ArticleParagraph>
          During reproduction these epigenetic markers are mostly erased and are
          not passed down to offspring. However, in some cases they may be
          completely missed in the erasure process.
        </ArticleParagraph>

        <ArticleParagraph>
          Epigenetic markers can be reapplied during embryonic development
          called developmental reprogramming, which is influenced by the
          environment the embryo is developing in. This is essentially the
          starting point at which we can start to think about how the
          environment can influence the phenotype of an organism.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>
          Representing this complexity in a simulation
        </ArticleHeading>

        <ArticleParagraph>
          The phenotype system is complex and dynamic. No two organisms have the
          same genotype or experience the same environment, so the phenotype of
          each individual is unique. The number of parameters that can influence
          the phenotype of an organism is vast. An individuals phenotype is also
          not static, it can change over time as the organism develops and as it
          interacts with the dynamic environment.
        </ArticleParagraph>

        <ArticleHeading level="h2">
          Environment, epistasis, pleiotropy and epigenetic effects
        </ArticleHeading>

        <ArticleParagraph>
          Vectors and matrices are a great way to represent the relationships
          between elements in a system. We can use these to represent the
          effects that genes have on other genes, the effects that epigenetic
          markers have on gene expression and finally the effects that genes
          have on the phenotype. The elements of these vectors and matrices will
          contain values either in the range of <Code>0</Code> to <Code>1</Code>{' '}
          or <Code>-1</Code> to <Code>1</Code> which will represent some kind of
          multiplier or weight.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="vector-matrix-calculation"
            description="A visual representation of how vectors and matrices can be used to produce results in a calculation"
          ></ArticleFig>
        </ArticleFigs>

        <ArticleHeading level="h2">Variable rate of change</ArticleHeading>

        <ArticleParagraph>
          <Link
            href="https://en.wikipedia.org/wiki/B%C3%A9zier_curve"
            target="BezierCurves"
          >
            Bezier curves
          </Link>{' '}
          are a parametric curve that's defined by a set of control points. We
          can use these to represent a <Text strong>rate of change</Text> for
          these effects. Randomly generating the endpoints and control points of
          our Bezier curve will provide us with a way to vary a population of
          individuals. <ArticleFigLink fig="bezier-curve-playground" /> provides
          an interactive playground for helping to visualise how these curves
          can be configured and used to generate a point of effect .
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="bezier-curve-playground"
            description="An interactive playground for configuring our rate of change curves"
          ></ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      {/* <ArticleSection>
        <ArticleHeading>Reproduction Frequency</ArticleHeading>

        <ArticleParagraph>
          Evolution is the natural process we all know, that explains how living
          organisms change over time through gradual genetic mutations. It
          operates through mechanisms like natural selection, genetic drift,
          mutations, and gene flow. It has some fundamental rules that effected
          how life has developed on our planet, and most importantly is the
          reproduction.
        </ArticleParagraph>

        <ArticleParagraph>
          When we start to think about reproduction there are a lot of inherent
          systems like time and lifespan. This gives us a good starting point to
          think about how we can simulate evolution at a quicker rate than real
          life, after all we don't have millions of years to wait for our
          results.
        </ArticleParagraph>
      </ArticleSection> */}

      {/* <ArticleSection>
        <ArticleHeading size="x5">Timing system and lifespan</ArticleHeading>

        <ArticleParagraph>
          Generations are often used in evolutionary simulators to reflect an
          individual's lifespan and within that time frame the individual will
          have experienced a life's worth of events and interactions, which will
          result in the individual's survival and reproduction.
        </ArticleParagraph>

        <ArticleParagraph>
          We will use the number <Code>1</Code> to represent a denominating
          factor of time, which will be used as a reference point for an
          individuals lifespan and all the events that occur within that time.
        </ArticleParagraph>
      </ArticleSection> */}

      {/* <ArticleFigs>
        <ArticleFigCodeBlock
          id="reproduction-frequency-example"
          description=""
          language="rust"
        >
          {`
Individual {
  /// The maximum lifespan of the individual.
  maximum_lifespan: 0.7,
  /// The ages at which the individual can reproduce.
  reproduction_age_range: (0.3, 0.6),
  /// The duration before the individual can reproduce again.
  reproduction_duration: 0.1,
}

          `}
        </ArticleFigCodeBlock>
      </ArticleFigs> */}

      {/* <ArticleSection>
        <ArticleHeading>Species representation</ArticleHeading>

        <ArticleParagraph>
          A single entity with be stored as a matrix, which will represent the
          attributes of that entity and will determine it's selection, grouping
          and reproduction. The dimensions of this matrix we'll parametrize with{' '}
          <Code>m</Code> and <Code>n</Code>.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="species-matrix"
            description=""
            flex="horizontal"
            alignChildren="middle"
            padding="x12"
          ></ArticleFig>
        </ArticleFigs>
      </ArticleSection> */}

      {/* <ArticleSection>
        <ArticleHeading size="x5">Reproduction</ArticleHeading>

        <ArticleParagraph>
          Individuals that survive and adapt to their environment are more
          likely to reproduce and pass on their advantageous traits to their
          offspring. Over time, these traits become more common in the
          population.
        </ArticleParagraph>
      </ArticleSection> */}

      {/* <ArticleSection>
        <ArticleHeading size="x5">Variation</ArticleHeading>

        <ArticleParagraph>
          Individuals within a species exhibit variations in physical traits and
          behaviors. These variations are often due to genetic mutations, which
          are random changes in the DNA sequence.
        </ArticleParagraph>

        <ArticleParagraph>
          We'll apply this same principle to our simulation. We'll use 2
          matrices in our mutation process, <Code>P</Code> and <Code>V</Code>,
          which will represent the probability of a mutation and a weight for
          that mutation respectively.
        </ArticleParagraph>
      </ArticleSection> */}

      {/* <ArticleSection>
        <ArticleHeading size="x5">Speciation</ArticleHeading>

        <ArticleParagraph>
          As changes accumulate over many generations, populations of a single
          species can diverge enough to become distinct species.
        </ArticleParagraph>
      </ArticleSection> */}

      {/* <ArticleSection>
        <ArticleHeading size="x5">Selection</ArticleHeading>

        <ArticleParagraph>
          In a given environment, some variations prove advantageous, giving
          those individuals a better chance at survival and reproduction.
        </ArticleParagraph>
      </ArticleSection> */}
    </ArticlePage>
  );
};

export default Article;
