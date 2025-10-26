import React from 'react';
import { Box, IconButton, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  GridOn,
  CropFree,
  Gradient,
  CheckBoxOutlineBlank,
  RadioButtonUnchecked,
  Apps,
} from '@mui/icons-material';

interface TestPatternsProps {
  onPatternSelect: (pattern: string | null) => void;
  activePattern: string | null;
}

export const TestPatterns: React.FC<TestPatternsProps> = ({
  onPatternSelect,
  activePattern,
}) => {
  const handlePatternChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPattern: string | null
  ) => {
    onPatternSelect(newPattern);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ToggleButtonGroup
        value={activePattern}
        exclusive
        onChange={handlePatternChange}
        size="small"
      >
        <ToggleButton value="grid">
          <Tooltip title="Grid Pattern">
            <GridOn />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="crosshair">
          <Tooltip title="Crosshair">
            <CropFree />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="gradient">
          <Tooltip title="Gradient">
            <Gradient />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="checkerboard">
          <Tooltip title="Checkerboard">
            <Apps />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="circles">
          <Tooltip title="Circle Grid">
            <RadioButtonUnchecked />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="border">
          <Tooltip title="Border Only">
            <CheckBoxOutlineBlank />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export class TestPatternRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
  }

  public render(pattern: string, color: string = '#00ff88') {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    switch (pattern) {
      case 'grid':
        this.drawGrid(color);
        break;
      case 'crosshair':
        this.drawCrosshair(color);
        break;
      case 'gradient':
        this.drawGradient(color);
        break;
      case 'checkerboard':
        this.drawCheckerboard(color);
        break;
      case 'circles':
        this.drawCircles(color);
        break;
      case 'border':
        this.drawBorder(color);
        break;
    }
  }

  private drawGrid(color: string) {
    const { width, height } = this.canvas;
    const gridSize = 50;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.5;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Center lines
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 1;

    this.ctx.beginPath();
    this.ctx.moveTo(width / 2, 0);
    this.ctx.lineTo(width / 2, height);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
  }

  private drawCrosshair(color: string) {
    const { width, height } = this.canvas;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    // Center cross
    this.ctx.beginPath();
    this.ctx.moveTo(width / 2, 0);
    this.ctx.lineTo(width / 2, height);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();

    // Corner marks
    const markSize = 50;
    this.ctx.lineWidth = 3;

    // Top-left
    this.ctx.beginPath();
    this.ctx.moveTo(0, markSize);
    this.ctx.lineTo(0, 0);
    this.ctx.lineTo(markSize, 0);
    this.ctx.stroke();

    // Top-right
    this.ctx.beginPath();
    this.ctx.moveTo(width - markSize, 0);
    this.ctx.lineTo(width, 0);
    this.ctx.lineTo(width, markSize);
    this.ctx.stroke();

    // Bottom-right
    this.ctx.beginPath();
    this.ctx.moveTo(width, height - markSize);
    this.ctx.lineTo(width, height);
    this.ctx.lineTo(width - markSize, height);
    this.ctx.stroke();

    // Bottom-left
    this.ctx.beginPath();
    this.ctx.moveTo(markSize, height);
    this.ctx.lineTo(0, height);
    this.ctx.lineTo(0, height - markSize);
    this.ctx.stroke();

    // Center circle
    this.ctx.beginPath();
    this.ctx.arc(width / 2, height / 2, 20, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  private drawGradient(color: string) {
    const { width, height } = this.canvas;

    // Parse color to RGB
    const rgb = this.hexToRgb(color);
    if (!rgb) return;

    // Horizontal gradient
    const gradientH = this.ctx.createLinearGradient(0, 0, width, 0);
    gradientH.addColorStop(0, 'black');
    gradientH.addColorStop(0.5, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    gradientH.addColorStop(1, 'white');

    this.ctx.fillStyle = gradientH;
    this.ctx.fillRect(0, 0, width, height / 2);

    // Vertical gradient
    const gradientV = this.ctx.createLinearGradient(0, height / 2, 0, height);
    gradientV.addColorStop(0, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    gradientV.addColorStop(1, 'black');

    this.ctx.fillStyle = gradientV;
    this.ctx.fillRect(0, height / 2, width, height / 2);
  }

  private drawCheckerboard(color: string) {
    const { width, height } = this.canvas;
    const squareSize = 50;

    this.ctx.fillStyle = color;

    for (let y = 0; y < height; y += squareSize) {
      for (let x = 0; x < width; x += squareSize) {
        if ((Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0) {
          this.ctx.fillRect(x, y, squareSize, squareSize);
        }
      }
    }
  }

  private drawCircles(color: string) {
    const { width, height } = this.canvas;
    const spacing = 60;
    const radius = 15;

    this.ctx.fillStyle = color;

    for (let y = spacing; y < height; y += spacing) {
      for (let x = spacing; x < width; x += spacing) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private drawBorder(color: string) {
    const { width, height } = this.canvas;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 5;

    this.ctx.strokeRect(0, 0, width, height);

    // Add diagonal lines
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.3;

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(width, height);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(width, 0);
    this.ctx.lineTo(0, height);
    this.ctx.stroke();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  public clear() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
  }
}