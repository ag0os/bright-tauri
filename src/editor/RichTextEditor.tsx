/**
 * Rich Text Editor Component
 *
 * A Lexical-based rich text editor with basic formatting capabilities.
 * Supports bold, italic, underline, headings, and lists.
 */

import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { EditorState } from 'lexical';
import { useState } from 'react';
import { ContentChangePlugin } from './plugins/ContentChangePlugin';
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
  const editorKey = readOnly ? 'read-only' : 'editable';

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
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
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
