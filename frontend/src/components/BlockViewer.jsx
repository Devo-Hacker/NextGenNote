import { parseContent } from '../utils/noteContent';

const BlockViewer = ({ content, textColorClass, mutedColorClass }) => {
  const blocks = parseContent(content);
  const hasAnyText = blocks.some((b) => b.text.trim());

  if (!hasAnyText) {
    return <p className={`text-base ${mutedColorClass}`}>This note is empty. Click Edit to start writing.</p>;
  }

  return (
    <div className="space-y-1.5">
      {blocks.map((block) => {
        if (!block.text.trim() && block.type === 'text') return <div key={block.id} className="h-2" />;
        return (
          <div key={block.id} className="flex items-start gap-2">
            {block.type === 'bullet' && (
              <span className={`mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-70 ${textColorClass}`} />
            )}
            {block.type === 'checklist' && (
              <span
                className={`mt-1 w-4 h-4 rounded border shrink-0 flex items-center justify-center text-[10px] ${
                  block.checked ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-400 dark:border-gray-500'
                }`}
              >
                {block.checked ? '✓' : ''}
              </span>
            )}
            <p
              className={`text-base leading-relaxed ${textColorClass} ${
                block.type === 'checklist' && block.checked ? 'line-through opacity-50' : ''
              }`}
            >
              {block.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default BlockViewer;