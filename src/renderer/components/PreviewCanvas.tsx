import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, IconButton, Slider, Typography, Paper } from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Grid3x3,
  Fullscreen,
} from '@mui/icons-material';

interface PreviewCanvasProps {
  width?: number;
  height?: number;
  onRender?: (ctx: CanvasRenderingContext2D) => void;
  showGrid?: boolean;
  gridSize?: number;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  width = 1920,
  height = 1080,
  onRender,
  showGrid = false,
  gridSize = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGridOverlay, setShowGridOverlay] = useState(showGrid);

  // Fit canvas to container
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const scaleX = container.width / width;
    const scaleY = container.height / height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some padding

    setZoom(scale);
    setPan({ x: 0, y: 0 });
  }, [width, height]);

  useEffect(() => {
    fitToView();
    window.addEventListener('resize', fitToView);
    return () => window.removeEventListener('resize', fitToView);
  }, [fitToView]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  }, []);

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse or Alt+Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Render canvas content
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid if enabled
    if (showGridOverlay) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center lines
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;

      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
    }

    // Draw thirds guide
    if (showGridOverlay) {
      ctx.strokeStyle = '#ff0088';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.setLineDash([5, 5]);

      // Rule of thirds
      for (let i = 1; i <= 2; i++) {
        const x = (width / 3) * i;
        const y = (height / 3) * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Call custom render function
    if (onRender) {
      ctx.save();
      onRender(ctx);
      ctx.restore();
    }

    // Draw border
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
  }, [width, height, showGridOverlay, gridSize, onRender]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          imageRendering: zoom > 2 ? 'pixelated' : 'auto',
        }}
      />

      {/* Controls */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          p: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <IconButton
          size="small"
          onClick={() => setShowGridOverlay(!showGridOverlay)}
          color={showGridOverlay ? 'primary' : 'default'}
        >
          <Grid3x3 />
        </IconButton>

        <IconButton size="small" onClick={() => setZoom(zoom * 0.8)}>
          <ZoomOut />
        </IconButton>

        <Slider
          value={zoom}
          onChange={(_, value) => setZoom(value as number)}
          min={0.1}
          max={5}
          step={0.1}
          sx={{ width: 100 }}
          size="small"
        />

        <IconButton size="small" onClick={() => setZoom(zoom * 1.2)}>
          <ZoomIn />
        </IconButton>

        <IconButton size="small" onClick={fitToView}>
          <CenterFocusStrong />
        </IconButton>

        <Typography variant="caption" sx={{ ml: 1, minWidth: 50 }}>
          {Math.round(zoom * 100)}%
        </Typography>
      </Paper>

      {/* Info Panel */}
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          p: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {width} × {height}px
        </Typography>
      </Paper>

      {/* Instructions */}
      {!isDragging && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            p: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Scroll: Zoom | Alt+Drag: Pan | Grid: G
          </Typography>
        </Box>
      )}
    </Box>
  );
};