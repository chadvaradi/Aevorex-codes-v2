import React from 'react';

type MiniChartProps = {
  data: number[];
  color: string;
};

const MiniChart: React.FC<MiniChartProps> = ({ data, color }) => {
  const svgWidth = 400;
  const svgHeight = 256;
  const padding = 20;
  const chartWidth = svgWidth - 2 * padding;
  const chartHeight = svgHeight - 2 * padding;

  const maxDataValue = Math.max(...data);
  const minDataValue = Math.min(...data);
  const dataRange = maxDataValue - minDataValue;

  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    if (dataRange === 0) {
      return chartHeight / 2 + padding;
    }
    return padding + chartHeight - ((value - minDataValue) / dataRange) * chartHeight;
  };

  const pathD = data.map((point, i) => {
    const x = getX(i);
    const y = getY(point);
    return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i * chartHeight) / 4}
            x2={padding + chartWidth}
            y2={padding + (i * chartHeight) / 4}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Data Path */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />

        {/* First and Last Point Labels */}
        <text x={getX(0)} y={getY(data[0]) - 10} fill="#6b7280" fontSize="12" textAnchor="middle">
          {data[0].toFixed(2)}
        </text>
        <text x={getX(data.length - 1)} y={getY(data[data.length - 1]) - 10} fill="#6b7280" fontSize="12" textAnchor="end">
          {data[data.length - 1].toFixed(2)}
        </text>
      </svg>
    </div>
  );
};

export default MiniChart; 