type Props = {
  contents: string;
  startLineNumber: number;
  endLineNumber: number;
};

export function getCodeSnippetFromFile({
  contents,
  startLineNumber,
  endLineNumber,
}: Props): string {
  return contents
    .split('\n')
    .slice(startLineNumber - 1, endLineNumber)
    .join('\n');
}
