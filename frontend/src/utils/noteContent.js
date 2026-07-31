// Converts between the block array (used by the editor UI) and the
// plain string stored in the database.

const BLOCK_PREFIX = '§BLOCKS§'; // marks content as structured, vs legacy plain text

export const isStructuredContent = (raw) => {
  return typeof raw === 'string' && raw.startsWith(BLOCK_PREFIX);
};

export const parseContent = (raw) => {
  if (!raw) return [{ id: crypto.randomUUID(), type: 'text', text: '' }];

  if (isStructuredContent(raw)) {
    try {
      const json = raw.slice(BLOCK_PREFIX.length);
      const blocks = JSON.parse(json);
      if (Array.isArray(blocks) && blocks.length > 0) return blocks;
    } catch {
      // fall through to legacy handling
    }
  }

  // legacy plain-text note: split into one text block per line
  const lines = raw.split('\n');
  return lines.map((line) => ({
    id: crypto.randomUUID(),
    type: 'text',
    text: line,
  }));
};

export const serializeContent = (blocks) => {
  return BLOCK_PREFIX + JSON.stringify(blocks);
};

// Plain-text fallback, used for search/preview snippets on the dashboard
export const blocksToPlainText = (raw) => {
  const blocks = parseContent(raw);
  return blocks
    .map((b) => (b.type === 'checklist' ? `${b.checked ? '[x]' : '[ ]'} ${b.text}` : b.text))
    .join('\n');
};