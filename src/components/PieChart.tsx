import React, { useState } from 'react';
import { HeirShare } from '../types';
import { formatRupiah } from '../utils/faraidh';

interface PieChartProps {
  shares: HeirShare[];
  tirkah: number;
}

export const PieChart: React.FC<PieChartProps> = ({ shares, tirkah }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeShares = shares.filter(s => s.status !== 'Mahjub' && s.nominalTotal > 0);
  const total = activeShares.reduce((acc, s) => acc + s.nominalTotal, 0);

  if (activeShares.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <p>Belum ada data ahli waris yang berhak untuk digambarkan.</p>
      </div>
    );
  }

  // Pre-calculate SVG arcs
  const radius = 100;
  const center = 140;
  const innerRadius = 55; // Donut style

  let cumulativeAngle = 0;
  const slices = activeShares.map((share, idx) => {
    const percentage = share.nominalTotal / total;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const ix1 = center + innerRadius * Math.cos(endRad);
    const iy1 = center + innerRadius * Math.sin(endRad);
    const ix2 = center + innerRadius * Math.cos(startRad);
    const iy2 = center + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix1} ${iy1}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
      Z
    `;

    return {
      share,
      pathData,
      percentage: percentage * 100,
      index: idx,
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-6 p-4">
      {/* SVG Container */}
      <div className="relative w-72 h-72 flex-shrink-0">
        <svg viewBox="0 0 280 280" className="w-full h-full drop-shadow-lg transition-transform">
          {slices.map(({ share, pathData, index }) => {
            const isHovered = hoveredIndex === index;
            return (
              <path
                key={share.title + index}
                d={pathData}
                fill={share.color}
                stroke="#0f172a"
                strokeWidth={isHovered ? '3' : '1.5'}
                className="transition-all duration-200 cursor-pointer hover:opacity-90"
                style={{
                  transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                  transformOrigin: `${center}px ${center}px`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
          {/* Donut Center Display */}
          <circle cx={center} cy={center} r={innerRadius - 4} className="fill-slate-900/90 dark:fill-slate-950/90" />
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            className="fill-emerald-400 font-bold text-xs uppercase tracking-wider"
          >
            Tirkah
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            className="fill-slate-100 font-extrabold text-xs"
          >
            {formatRupiah(tirkah).replace(',00', '')}
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && activeShares[hoveredIndex] && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/95 border border-emerald-500/40 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl text-center backdrop-blur-sm">
              <p className="font-bold text-emerald-300">{activeShares[hoveredIndex].title}</p>
              <p className="text-[11px] font-semibold text-amber-300">
                {((activeShares[hoveredIndex].nominalTotal / total) * 100).toFixed(1)}% ({formatRupiah(activeShares[hoveredIndex].nominalTotal)})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Details */}
      <div className="flex-1 w-full space-y-2">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Komposisi Pembagian Harta Waris
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeShares.map((share, idx) => {
            const isHovered = hoveredIndex === idx;
            const pct = ((share.nominalTotal / total) * 100).toFixed(1);
            return (
              <div
                key={share.title + idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: share.color }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {share.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {share.fractionStr}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {pct}%
                  </p>
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                    {formatRupiah(share.nominalTotal)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
