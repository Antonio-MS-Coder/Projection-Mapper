import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Slider,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  WbSunny,
  Waves,
  Gradient,
  BlurOn,
  FlashOn,
  AllOut,
  Lens,
  RadioButtonChecked,
  ViewModule,
  Grain,
  Timeline,
  StarBorder,
  PlayArrow,
  Pause,
} from '@mui/icons-material';

export interface LightPattern {
  id: string;
  name: string;
  type: 'static' | 'animated';
  icon: React.ReactNode;
  config: {
    colors: string[];
    speed?: number; // Animation speed (0-1)
    intensity?: number; // Pattern intensity (0-1)
    direction?: 'horizontal' | 'vertical' | 'radial' | 'diagonal';
    frequency?: number; // For wave patterns
    borderWidth?: number; // Border thickness
    fillOpacity?: number; // Fill opacity
    strokeDashArray?: string; // Dashed border pattern
  };
}

export const PRESET_PATTERNS: LightPattern[] = [
  {
    id: 'solid',
    name: 'Solid Fill',
    type: 'static',
    icon: <Lens />,
    config: {
      colors: ['#00ff88'],
      fillOpacity: 1,
      borderWidth: 0,
    },
  },
  {
    id: 'border-only',
    name: 'Border Only',
    type: 'static',
    icon: <RadioButtonChecked />,
    config: {
      colors: ['#00ff88'],
      fillOpacity: 0,
      borderWidth: 3,
    },
  },
  {
    id: 'border-fill',
    name: 'Border + Fill',
    type: 'static',
    icon: <AllOut />,
    config: {
      colors: ['#00ff88', '#00ff8850'],
      fillOpacity: 0.3,
      borderWidth: 2,
    },
  },
  {
    id: 'gradient-linear',
    name: 'Linear Gradient',
    type: 'static',
    icon: <Gradient />,
    config: {
      colors: ['#00ff88', '#ff0088', '#0088ff'],
      direction: 'horizontal',
      fillOpacity: 1,
      borderWidth: 0,
    },
  },
  {
    id: 'gradient-radial',
    name: 'Radial Gradient',
    type: 'static',
    icon: <BlurOn />,
    config: {
      colors: ['#ffffff', '#00ff88', '#000000'],
      direction: 'radial',
      fillOpacity: 1,
      borderWidth: 0,
    },
  },
  {
    id: 'strobe',
    name: 'Strobe',
    type: 'animated',
    icon: <FlashOn />,
    config: {
      colors: ['#ffffff', '#000000'],
      speed: 0.9,
      intensity: 1,
    },
  },
  {
    id: 'pulse',
    name: 'Pulse',
    type: 'animated',
    icon: <WbSunny />,
    config: {
      colors: ['#00ff88'],
      speed: 0.3,
      intensity: 0.8,
      fillOpacity: 1,
    },
  },
  {
    id: 'wave',
    name: 'Wave',
    type: 'animated',
    icon: <Waves />,
    config: {
      colors: ['#0088ff', '#00ffff'],
      speed: 0.5,
      direction: 'horizontal',
      frequency: 3,
      fillOpacity: 1,
    },
  },
  {
    id: 'rainbow',
    name: 'Rainbow Cycle',
    type: 'animated',
    icon: <StarBorder />,
    config: {
      colors: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'],
      speed: 0.2,
      direction: 'horizontal',
      fillOpacity: 1,
    },
  },
  {
    id: 'scan',
    name: 'Scanner',
    type: 'animated',
    icon: <Timeline />,
    config: {
      colors: ['#00ff88', '#000000'],
      speed: 0.6,
      direction: 'vertical',
      borderWidth: 0,
      fillOpacity: 1,
    },
  },
  {
    id: 'dots',
    name: 'Dot Matrix',
    type: 'static',
    icon: <ViewModule />,
    config: {
      colors: ['#00ff88'],
      frequency: 10,
      fillOpacity: 0,
      borderWidth: 0,
    },
  },
  {
    id: 'noise',
    name: 'TV Static',
    type: 'animated',
    icon: <Grain />,
    config: {
      colors: ['#ffffff', '#000000'],
      speed: 1,
      intensity: 0.5,
    },
  },
];

interface LightPatternSelectorProps {
  selectedPattern: LightPattern | null;
  onPatternSelect: (pattern: LightPattern) => void;
  onConfigChange: (config: Partial<LightPattern['config']>) => void;
}

export const LightPatternSelector: React.FC<LightPatternSelectorProps> = ({
  selectedPattern,
  onPatternSelect,
  onConfigChange,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [showBorder, setShowBorder] = React.useState(true);
  const [showFill, setShowFill] = React.useState(true);

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Light Patterns</Typography>
        {selectedPattern?.type === 'animated' && (
          <IconButton onClick={() => setIsPlaying(!isPlaying)} size="small">
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        )}
      </Box>

      <Grid container spacing={1} sx={{ mb: 3 }}>
        {PRESET_PATTERNS.map((pattern) => (
          <Grid item xs={4} key={pattern.id}>
            <Card
              sx={{
                backgroundColor: selectedPattern?.id === pattern.id ? 'primary.dark' : 'background.paper',
                border: selectedPattern?.id === pattern.id ? '2px solid' : '1px solid',
                borderColor: selectedPattern?.id === pattern.id ? 'primary.main' : 'divider',
              }}
            >
              <CardActionArea onClick={() => onPatternSelect(pattern)}>
                <CardContent sx={{ p: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 0.5 }}>{pattern.icon}</Box>
                  <Typography variant="caption" noWrap>
                    {pattern.name}
                  </Typography>
                  {pattern.type === 'animated' && (
                    <Chip label="Animated" size="small" sx={{ mt: 0.5 }} />
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedPattern && (
        <Stack spacing={2}>
          <Typography variant="subtitle2">Pattern Settings</Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showBorder}
                  onChange={(e) => {
                    setShowBorder(e.target.checked);
                    onConfigChange({ borderWidth: e.target.checked ? 2 : 0 });
                  }}
                />
              }
              label="Border"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showFill}
                  onChange={(e) => {
                    setShowFill(e.target.checked);
                    onConfigChange({ fillOpacity: e.target.checked ? 1 : 0 });
                  }}
                />
              }
              label="Fill"
            />
          </Box>

          {showBorder && (
            <Box>
              <Typography variant="caption">Border Width</Typography>
              <Slider
                value={selectedPattern.config.borderWidth || 2}
                onChange={(_, value) => onConfigChange({ borderWidth: value as number })}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>
          )}

          {showFill && (
            <Box>
              <Typography variant="caption">Fill Opacity</Typography>
              <Slider
                value={selectedPattern.config.fillOpacity || 1}
                onChange={(_, value) => onConfigChange({ fillOpacity: value as number })}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>
          )}

          {selectedPattern.type === 'animated' && (
            <>
              <Box>
                <Typography variant="caption">Animation Speed</Typography>
                <Slider
                  value={selectedPattern.config.speed || 0.5}
                  onChange={(_, value) => onConfigChange({ speed: value as number })}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                  size="small"
                />
              </Box>

              {selectedPattern.config.intensity !== undefined && (
                <Box>
                  <Typography variant="caption">Intensity</Typography>
                  <Slider
                    value={selectedPattern.config.intensity}
                    onChange={(_, value) => onConfigChange({ intensity: value as number })}
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
};

export class LightPatternRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrame: number | null = null;
  private startTime: number = Date.now();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
  }

  public render(pattern: LightPattern, isPlaying: boolean = true) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    if (pattern.type === 'animated' && isPlaying) {
      this.renderAnimated(pattern);
    } else {
      this.renderStatic(pattern);
    }
  }

  private renderStatic(pattern: LightPattern) {
    const { width, height } = this.canvas;
    const { colors, fillOpacity = 1, borderWidth = 0, direction } = pattern.config;

    this.ctx.clearRect(0, 0, width, height);

    // Fill
    if (fillOpacity > 0) {
      if (pattern.id === 'gradient-linear') {
        const gradient = this.createLinearGradient(colors, direction || 'horizontal');
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = fillOpacity;
        this.ctx.fillRect(0, 0, width, height);
      } else if (pattern.id === 'gradient-radial') {
        const gradient = this.createRadialGradient(colors);
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = fillOpacity;
        this.ctx.fillRect(0, 0, width, height);
      } else if (pattern.id === 'dots') {
        this.renderDots(colors[0], pattern.config.frequency || 10);
      } else {
        this.ctx.fillStyle = colors[0];
        this.ctx.globalAlpha = fillOpacity;
        this.ctx.fillRect(0, 0, width, height);
      }
    }

    // Border
    if (borderWidth > 0) {
      this.ctx.globalAlpha = 1;
      this.ctx.strokeStyle = colors[0];
      this.ctx.lineWidth = borderWidth;
      this.ctx.strokeRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
    }
  }

  private renderAnimated(pattern: LightPattern) {
    const animate = () => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const { width, height } = this.canvas;
      const { colors, speed = 0.5, intensity = 1, direction, frequency } = pattern.config;

      this.ctx.clearRect(0, 0, width, height);

      switch (pattern.id) {
        case 'strobe':
          this.renderStrobe(colors, speed, intensity, elapsed);
          break;
        case 'pulse':
          this.renderPulse(colors[0], speed, intensity, elapsed);
          break;
        case 'wave':
          this.renderWave(colors, speed, direction || 'horizontal', frequency || 3, elapsed);
          break;
        case 'rainbow':
          this.renderRainbow(colors, speed, elapsed);
          break;
        case 'scan':
          this.renderScan(colors[0], speed, direction || 'vertical', elapsed);
          break;
        case 'noise':
          this.renderNoise(intensity);
          break;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  private renderStrobe(colors: string[], speed: number, intensity: number, elapsed: number) {
    const frequency = speed * 10;
    const strobe = Math.sin(elapsed * frequency * Math.PI) > 0;

    this.ctx.fillStyle = strobe ? colors[0] : colors[1];
    this.ctx.globalAlpha = intensity;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderPulse(color: string, speed: number, intensity: number, elapsed: number) {
    const pulse = (Math.sin(elapsed * speed * Math.PI * 2) + 1) / 2;

    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = pulse * intensity;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderWave(colors: string[], speed: number, direction: string, frequency: number, elapsed: number) {
    const { width, height } = this.canvas;
    const gradient = this.ctx.createLinearGradient(0, 0, direction === 'horizontal' ? width : 0, direction === 'horizontal' ? 0 : height);

    const offset = (elapsed * speed) % 1;

    for (let i = 0; i < frequency; i++) {
      const pos1 = (i / frequency + offset) % 1;
      const pos2 = ((i + 0.5) / frequency + offset) % 1;

      gradient.addColorStop(pos1, colors[0]);
      gradient.addColorStop(pos2, colors[1] || colors[0]);
    }

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  private renderRainbow(colors: string[], speed: number, elapsed: number) {
    const { width, height } = this.canvas;
    const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
    const offset = (elapsed * speed) % 1;

    colors.forEach((color, i) => {
      const position = ((i / colors.length) + offset) % 1;
      gradient.addColorStop(position, color);
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  private renderScan(color: string, speed: number, direction: string, elapsed: number) {
    const { width, height } = this.canvas;
    const position = (elapsed * speed) % 1;
    const scanWidth = 50;

    if (direction === 'vertical') {
      const y = position * height;
      const gradient = this.ctx.createLinearGradient(0, y - scanWidth, 0, y + scanWidth);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, width, height);
    } else {
      const x = position * width;
      const gradient = this.ctx.createLinearGradient(x - scanWidth, 0, x + scanWidth, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, width, height);
    }
  }

  private renderNoise(intensity: number) {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255 * intensity;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private renderDots(color: string, frequency: number) {
    const { width, height } = this.canvas;
    const dotSize = Math.min(width, height) / frequency / 2;

    this.ctx.fillStyle = color;

    for (let y = 0; y < frequency; y++) {
      for (let x = 0; x < frequency; x++) {
        const cx = (x + 0.5) * (width / frequency);
        const cy = (y + 0.5) * (height / frequency);

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, dotSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private createLinearGradient(colors: string[], direction: string): CanvasGradient {
    const { width, height } = this.canvas;
    let gradient: CanvasGradient;

    switch (direction) {
      case 'vertical':
        gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        break;
      case 'diagonal':
        gradient = this.ctx.createLinearGradient(0, 0, width, height);
        break;
      default: // horizontal
        gradient = this.ctx.createLinearGradient(0, 0, width, 0);
    }

    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });

    return gradient;
  }

  private createRadialGradient(colors: string[]): CanvasGradient {
    const { width, height } = this.canvas;
    const gradient = this.ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );

    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });

    return gradient;
  }

  public destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}