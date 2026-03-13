/**
 * Count words from a serialized Lexical editor state.
 */
export function countLexicalWords(editorContent: string): number {
  if (!editorContent) return 0;

  try {
    const editorState = JSON.parse(editorContent);

    const extractText = (node: unknown): string => {
      if (!node || typeof node !== 'object') return '';

      const value = node as Record<string, unknown>;

      if (typeof value.text === 'string') {
        return value.text;
      }

      if (Array.isArray(value.children)) {
        return value.children.map(extractText).join(' ');
      }

      return '';
    };

    const text = extractText(editorState.root);
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  } catch {
    return 0;
  }
}
