import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
      mermaidInitialized = true;
    }

    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);
        if (containerRef.current) containerRef.current.innerHTML = svg;
        setError('');
      } catch (err) {
        console.error('Mermaid render failed', err);
        setError('Could not render diagram from the generated syntax.');
      }
    };

    if (chart) render();
  }, [chart]);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return <div ref={containerRef} className="overflow-x-auto" />;
};

export default MermaidDiagram;