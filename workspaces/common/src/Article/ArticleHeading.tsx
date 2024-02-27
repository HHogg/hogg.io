import { Text, TextProps } from 'preshape';

const ArticleHeading = (props: TextProps) => {
  return (
    <Text
      {...props}
      margin="x2"
      size="x7"
      weight="x2"
      style={{
        lineHeight: 1.8,
        letterSpacing: ' 0.3px',
        // fontWeight: 460,
        fontFamily:
          'Inter, -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        WebkitTextSizeAdjust: '100%',
      }}
    />
  );
};

export default ArticleHeading;
