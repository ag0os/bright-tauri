/**
 * Toolbar Plugin
 *
 * Provides formatting toolbar for the Lexical editor.
 * Supports bold, italic, underline, headings, and lists.
 */

import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
  ListBullets,
  ListNumbers,
  TextB,
  TextHOne,
  TextHTwo,
  TextItalic,
  TextUnderline,
} from '@phosphor-icons/react';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';

type ToolbarBlockType = 'paragraph' | HeadingTagType | 'ul' | 'ol';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<ToolbarBlockType>('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else if ($isListNode(element)) {
        setBlockType(element.getTag());
      } else {
        setBlockType('paragraph');
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar]);

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType === headingSize) {
      // Toggle off: convert to paragraph
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      if (blockType === 'ul') {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }
    } else {
      if (blockType === 'ol') {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
    }
  };

  return (
    <div className="editor-toolbar">
      <button
        type="button"
        className={`toolbar-button ${isBold ? 'active' : ''}`}
        onClick={() => formatText('bold')}
        aria-label="Format Bold"
        title="Bold"
      >
        <TextB size={18} weight="duotone" />
      </button>
      <button
        type="button"
        className={`toolbar-button ${isItalic ? 'active' : ''}`}
        onClick={() => formatText('italic')}
        aria-label="Format Italic"
        title="Italic"
      >
        <TextItalic size={18} weight="duotone" />
      </button>
      <button
        type="button"
        className={`toolbar-button ${isUnderline ? 'active' : ''}`}
        onClick={() => formatText('underline')}
        aria-label="Format Underline"
        title="Underline"
      >
        <TextUnderline size={18} weight="duotone" />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        className={`toolbar-button ${blockType === 'h1' ? 'active' : ''}`}
        onClick={() => formatHeading('h1')}
        aria-label="Heading 1"
        title="Heading 1"
      >
        <TextHOne size={18} weight="duotone" />
      </button>
      <button
        type="button"
        className={`toolbar-button ${blockType === 'h2' ? 'active' : ''}`}
        onClick={() => formatHeading('h2')}
        aria-label="Heading 2"
        title="Heading 2"
      >
        <TextHTwo size={18} weight="duotone" />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        className={`toolbar-button ${blockType === 'ul' ? 'active' : ''}`}
        onClick={() => formatList('bullet')}
        aria-label="Bullet List"
        title="Bullet List"
      >
        <ListBullets size={18} weight="duotone" />
      </button>
      <button
        type="button"
        className={`toolbar-button ${blockType === 'ol' ? 'active' : ''}`}
        onClick={() => formatList('number')}
        aria-label="Numbered List"
        title="Numbered List"
      >
        <ListNumbers size={18} weight="duotone" />
      </button>
    </div>
  );
}
