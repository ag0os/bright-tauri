/**
 * Rich Text Editor Component
 *
 * A Lexical-based rich text editor with basic formatting capabilities.
 * Supports bold, italic, underline, headings, and lists.
 */

import { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ContentChangePlugin } from './plugins/ContentChangePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { EditorState } from 'lexical';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import './RichTextEditor.css';

export interface RichTextEditorProps {
  /** Initial content as JSON string (Lexical EditorState) */
  initialContent?: string;
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Placeholder text when editor is empty */
  placeholder?: string;
}

/**
 * RichTextEditor Component
 */
export function RichTextEditor({
  initialContent,
  onChange,
  readOnly = false,
  placeholder = 'Start writing...',
}: RichTextEditorProps) {
  // Store the initial content only once when the component first mounts
  // This prevents the editor from remounting on every keystroke
  const [initialEditorState] = useState(() => initialContent || null);
  const [editorKey, setEditorKey] = useState(0);

  // Only reset editor when readOnly changes (not on content changes)
  // Content changes are handled internally by Lexical
  useEffect(() => {
    setEditorKey((prev) => prev + 1);
  }, [readOnly]);

  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: {
      paragraph: 'editor-paragraph',
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
      },
      heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
      },
      list: {
        ul: 'editor-list-ul',
        ol: 'editor-list-ol',
        listitem: 'editor-listitem',
      },
      quote: 'editor-quote',
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    editable: !readOnly,
    editorState: initialEditorState,
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error);
    },
  };

  const handleChange = (editorState: EditorState) => {
    if (onChange && !readOnly) {
      const json = JSON.stringify(editorState.toJSON());
      onChange(json);
    }
  };

  return (
    <div className={`rich-text-editor ${readOnly ? 'read-only' : ''}`}>
      <LexicalComposer key={editorKey} initialConfig={initialConfig}>
        {!readOnly && <ToolbarPlugin />}
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-content"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={() => <div>Error loading editor</div>}
          />
          <HistoryPlugin />
          <ContentChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}
