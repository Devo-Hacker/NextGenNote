import { useRef, useEffect } from 'react';
import { List, CheckSquare, Type, Trash2 } from 'lucide-react';

const BlockEditor = ({ blocks, onChange, textColorClass, mutedColorClass }) => {
  const refs = useRef({});

  const updateBlock = (id, fields) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...fields } : b)));
  };

  const addBlockAfter = (id, type = 'text') => {
    const index = blocks.findIndex((b) => b.id === id);
    const newBlock = { id: crypto.randomUUID(), type, text: '', checked: false };
    const next = [...blocks];
    next.splice(index + 1, 0, newBlock);
    onChange(next);
    setTimeout(() => refs.current[newBlock.id]?.focus(), 0);
  };

  const removeBlock = (id) => {
    if (blocks.length === 1) {
      updateBlock(id, { text: '' });
      return;
    }
    const index = blocks.findIndex((b) => b.id === id);
    const next = blocks.filter((b) => b.id !== id);
    onChange(next);
    const prevBlock = next[Math.max(0, index - 1)];
    setTimeout(() => refs.current[prevBlock?.id]?.focus(), 0);
  };

  const cycleType = (id) => {
    const block = blocks.find((b) => b.id === id);
    const order = ['text', 'bullet', 'checklist'];
    const nextType = order[(order.indexOf(block.type) + 1) % order.length];
    updateBlock(id, { type: nextType, checked: nextType === 'checklist' ? false : undefined });
  };

  const handleKeyDown = (e, block) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBlockAfter(block.id, block.type === 'text' ? 'text' : block.type);
    } else if (e.key === 'Backspace' && block.text === '') {
      e.preventDefault();
      removeBlock(block.id);
    }
  };

  return (
    <div className="space-y-1">
      {blocks.map((block) => (
        <div key={block.id} className="group flex items-start gap-2">
          {/* Type toggle icon */}
          <button
            type="button"
            onClick={() => cycleType(block.id)}
            title="Click to change line type (text / bullet / checklist)"
            className={`mt-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity ${mutedColorClass}`}
          >
            {block.type === 'text' && <Type size={13} />}
            {block.type === 'bullet' && <List size={13} />}
            {block.type === 'checklist' && <CheckSquare size={13} />}
          </button>

          {/* Bullet dot */}
          {block.type === 'bullet' && (
            <span className={`mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 ${textColorClass} bg-current opacity-70`} />
          )}

          {/* Checkbox */}
          {block.type === 'checklist' && (
            <button
              type="button"
              onClick={() => updateBlock(block.id, { checked: !block.checked })}
              className={`mt-1.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                block.checked
                  ? 'bg-purple-600 border-purple-600'
                  : 'border-gray-400 dark:border-gray-500'
              }`}
            >
              {block.checked && <CheckSquare size={11} className="text-white" strokeWidth={3} />}
            </button>
          )}

          {/* Text input */}
          <input
            ref={(el) => (refs.current[block.id] = el)}
            type="text"
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, block)}
            placeholder={
              block.type === 'checklist' ? 'To-do item...' : block.type === 'bullet' ? 'List item...' : 'Start writing...'
            }
            className={`flex-1 bg-transparent outline-none text-base leading-relaxed py-0.5 ${textColorClass} ${
              block.type === 'checklist' && block.checked ? 'line-through opacity-50' : ''
            }`}
          />

          {/* Delete button, visible on hover */}
          <button
            type="button"
            onClick={() => removeBlock(block.id)}
            className={`mt-1.5 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity shrink-0 ${mutedColorClass}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addBlockAfter(blocks[blocks.length - 1].id, 'text')}
        className={`text-xs mt-2 opacity-50 hover:opacity-100 transition-opacity ${mutedColorClass}`}
      >
        + Add line
      </button>
    </div>
  );
};

export default BlockEditor;