import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useProjectStore } from '../stores/useProjectStore';
import { Vec2 } from '@shared/types';

interface CalibrationOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const CalibrationOverlay: React.FC<CalibrationOverlayProps> = ({ canvasRef }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<{
    geometryId: string;
    pointIndex: number;
  } | null>(null);

  const { project, selectedGeometryId, updateGeometryPoint } = useProjectStore();

  const getCanvasCoordinates = (e: MouseEvent): Vec2 => {
    if (!canvasRef.current || !overlayRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    return { x, y };
  };

  const handleMouseDown = (geometryId: string, pointIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingPoint({ geometryId, pointIndex });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingPoint) return;

    const coords = getCanvasCoordinates(e);
    updateGeometryPoint(draggingPoint.geometryId, draggingPoint.pointIndex, coords);
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  useEffect(() => {
    if (draggingPoint) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingPoint]);

  const convertToScreenCoords = (point: Vec2, rect: DOMRect): { x: number; y: number } => {
    return {
      x: ((point.x + 1) / 2) * rect.width,
      y: ((1 - point.y) / 2) * rect.height,
    };
  };

  return (
    <Box
      ref={overlayRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto',
        zIndex: 10,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {project.geometries.map((geometry) => {
          if (!geometry.visible || !canvasRef.current) return null;

          const rect = canvasRef.current.getBoundingClientRect();
          const points = geometry.points.map((p) => convertToScreenCoords(p.position, rect));
          const isSelected = geometry.id === selectedGeometryId;

          return (
            <g key={geometry.id}>
              {/* Draw quad outline */}
              <polygon
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={isSelected ? '#00ff88' : '#888'}
                strokeWidth={isSelected ? 2 : 1}
                strokeDasharray={isSelected ? '0' : '5,5'}
                opacity={0.8}
              />

              {/* Draw lines between points */}
              {points.map((point, i) => {
                const nextPoint = points[(i + 1) % points.length];
                return (
                  <line
                    key={`line-${i}`}
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke={isSelected ? '#00ff88' : '#888'}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={0.8}
                  />
                );
              })}

              {/* Draw control points */}
              {isSelected &&
                points.map((point, i) => (
                  <g key={`point-${i}`}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={8}
                      fill="#00ff88"
                      stroke="#000"
                      strokeWidth={2}
                      style={{ cursor: 'grab' }}
                      onMouseDown={handleMouseDown(geometry.id, i)}
                    />
                    <text
                      x={point.x}
                      y={point.y - 12}
                      fill="#00ff88"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {i + 1}
                    </text>
                  </g>
                ))}
            </g>
          );
        })}
      </svg>
    </Box>
  );
};