import { useState } from 'react';
import { PAPERS } from '../data/papers';

interface SimulationProps {
  paper: typeof PAPERS[0];
}

const Simulation = ({ paper }: SimulationProps) => {
  const [activeNode, setActiveNode] = useState<typeof paper.concepts[0] | null>(null);

  return (
    <div className="bg-stone-100 rounded-lg p-6 border border-stone-200 h-96 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 bg-white/80 p-2 rounded shadow-sm text-xs font-serif text-stone-600">
        Interactive Concept Map
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full cursor-pointer">
        <line x1={paper.concepts[0].x} y1={paper.concepts[0].y} x2={paper.concepts[1].x} y2={paper.concepts[1].y} stroke="#d6d3d1" strokeWidth="0.5" />
        <line x1={paper.concepts[1].x} y1={paper.concepts[1].y} x2={paper.concepts[2].x} y2={paper.concepts[2].y} stroke="#d6d3d1" strokeWidth="0.5" />

        {paper.concepts.map((node) => (
          <g
            key={node.id}
            onClick={() => setActiveNode(node)}
            className="transition-all duration-500 hover:opacity-80"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r / 3}
              fill={activeNode?.id === node.id ? "#b91c1c" : node.color}
              className="transition-colors duration-300"
            />
            <text
              x={node.x}
              y={node.y + (node.r/3) + 5}
              textAnchor="middle"
              fontSize="3"
              fontFamily="serif"
              fill="#292524"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {activeNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded shadow-lg border-l-4 border-red-700 animate-fade-in">
          <h4 className="font-serif font-bold text-stone-900">{activeNode.label}</h4>
          <p className="text-sm text-stone-600 mt-1">
            Core concept extracted from {paper.title}. Connects to {paper.concepts.find(c => c.id !== activeNode.id)?.label}.
          </p>
          <button
            onClick={(e) => {e.stopPropagation(); setActiveNode(null)}}
            className="absolute top-2 right-2 text-stone-400 hover:text-stone-900"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Simulation;
