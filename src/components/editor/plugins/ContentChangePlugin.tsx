/**
 * ContentChangePlugin
 *
 * A Lexical plugin that only fires onChange when actual content changes,
 * not on selection or cursor changes. Compares serialized JSON states
 * to detect real content changes.
 */

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorState } from 'lexical';

export interface ContentChangePluginProps {
  onChange: (editorState: EditorState) => void;
}

/**
 * Extracts only the content from editor state JSON, excluding selection data.
 * This ensures we only detect actual text/formatting changes.
 */
function getContentJson(editorState: EditorState): string {
  const json = editorState.toJSON();
  // Only serialize the root content, not selection
  return JSON.stringify(json.root);
}

export function ContentChangePlugin({ onChange }: ContentChangePluginProps) {
  const [editor] = useLexicalComposerContext();
  const lastContentRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize with current content
    const initialState = editor.getEditorState();
    lastContentRef.current = getContentJson(initialState);

    return editor.registerUpdateListener(({ editorState }) => {
      const currentContent = getContentJson(editorState);

      // Only fire onChange if content actually changed
      if (currentContent !== lastContentRef.current) {
        lastContentRef.current = currentContent;
        onChange(editorState);
      }
    });
  }, [editor, onChange]);

  return null;
}
