/**
 * StoryDiff Component Tests
 *
 * Tests for the diff viewer functionality, particularly the diff parsing logic.
 */

import { describe, it, expect } from 'vitest';

/**
 * Represents a parsed line from a unified diff
 */
interface DiffLine {
  type: 'added' | 'deleted' | 'context' | 'header';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

/**
 * Parse unified diff format into structured lines
 * (Copied from StoryDiff.tsx for testing purposes)
 */
function parseDiff(diffText: string): DiffLine[] {
  if (!diffText) return [];

  const lines = diffText.split('\n');
  const parsedLines: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    // Skip diff metadata lines (except the @@ hunk headers)
    if (line.startsWith('diff --git') ||
        line.startsWith('index ') ||
        line.startsWith('---') ||
        line.startsWith('+++')) {
      continue;
    }

    // Hunk header (e.g., @@ -1,4 +1,6 @@)
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[2], 10);
      }
      parsedLines.push({
        type: 'header',
        content: line,
      });
      continue;
    }

    // Added line
    if (line.startsWith('+')) {
      parsedLines.push({
        type: 'added',
        newLineNumber: newLine,
        content: line.substring(1),
      });
      newLine++;
      continue;
    }

    // Deleted line
    if (line.startsWith('-')) {
      parsedLines.push({
        type: 'deleted',
        oldLineNumber: oldLine,
        content: line.substring(1),
      });
      oldLine++;
      continue;
    }

    // Context line (unchanged)
    parsedLines.push({
      type: 'context',
      oldLineNumber: oldLine,
      newLineNumber: newLine,
      content: line.startsWith(' ') ? line.substring(1) : line,
    });
    oldLine++;
    newLine++;
  }

  return parsedLines;
}

describe('StoryDiff - parseDiff', () => {
  it('should return empty array for empty diff', () => {
    const result = parseDiff('');
    expect(result).toEqual([]);
  });

  it('should parse a simple addition', () => {
    const diff = `@@ -1,3 +1,4 @@
 Line 1
 Line 2
+New Line
 Line 3`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      type: 'header',
      content: '@@ -1,3 +1,4 @@',
    });
    expect(result[1]).toMatchObject({
      type: 'context',
      oldLineNumber: 1,
      newLineNumber: 1,
      content: 'Line 1',
    });
    expect(result[3]).toMatchObject({
      type: 'added',
      newLineNumber: 3,
      content: 'New Line',
    });
  });

  it('should parse a simple deletion', () => {
    const diff = `@@ -1,4 +1,3 @@
 Line 1
 Line 2
-Deleted Line
 Line 3`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(5);
    expect(result[3]).toMatchObject({
      type: 'deleted',
      oldLineNumber: 3,
      content: 'Deleted Line',
    });
  });

  it('should parse mixed changes', () => {
    const diff = `@@ -1,5 +1,5 @@
 Line 1
-Old Line 2
+New Line 2
 Line 3
-Old Line 4
+New Line 4
 Line 5`;

    const result = parseDiff(diff);

    // Should have header + 7 lines (3 context, 2 deletions, 2 additions)
    expect(result).toHaveLength(8);
    expect(result[2].type).toBe('deleted');
    expect(result[3].type).toBe('added');
    expect(result[5].type).toBe('deleted');
    expect(result[6].type).toBe('added');
  });

  it('should skip metadata lines', () => {
    const diff = `diff --git a/file.txt b/file.txt
index abc123..def456 100644
--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,3 @@
 Line 1
+Line 2
 Line 3`;

    const result = parseDiff(diff);

    // Should only have header + 3 content lines (skipping metadata)
    expect(result).toHaveLength(4);
    expect(result[0].type).toBe('header');
    expect(result[1].type).toBe('context');
    expect(result[2].type).toBe('added');
    expect(result[3].type).toBe('context');
  });

  it('should handle multiple hunks', () => {
    const diff = `@@ -1,2 +1,2 @@
 Line 1
-Old Line 2
+New Line 2
@@ -10,2 +10,2 @@
 Line 10
-Old Line 11
+New Line 11`;

    const result = parseDiff(diff);

    // 2 headers + 6 content lines
    expect(result).toHaveLength(8);
    expect(result[0].type).toBe('header');
    expect(result[4].type).toBe('header');
  });

  it('should handle empty lines correctly', () => {
    const diff = `@@ -1,3 +1,3 @@
 Line 1

 Line 3`;

    const result = parseDiff(diff);

    expect(result).toHaveLength(4);
    expect(result[2].content).toBe('');
  });
});
