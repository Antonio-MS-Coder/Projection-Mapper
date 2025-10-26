import React from 'react';
import { Box, Typography, Slider, Stack, Paper } from '@mui/material';
import { useProjectStore } from '../stores/useProjectStore';

export const ControlPanel: React.FC = () => {
  const { project, updateGlobalSettings } = useProjectStore();

  const handleIntensityChange = (_: any, value: number | number[]) => {
    updateGlobalSettings({ intensity: value as number });
  };

  const handleTintChange = (channel: 'r' | 'g' | 'b') => (_: any, value: number | number[]) => {
    updateGlobalSettings({
      tint: {
        ...project.global.tint,
        [channel]: value as number,
      },
    });
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Global Controls
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Master Intensity
          </Typography>
          <Slider
            value={project.global.intensity}
            onChange={handleIntensityChange}
            min={0}
            max={1}
            step={0.01}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            sx={{ color: 'primary.main' }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Color Tint
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="error.main">
                Red
              </Typography>
              <Slider
                value={project.global.tint.r}
                onChange={handleTintChange('r')}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                sx={{ color: 'error.main' }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="success.main">
                Green
              </Typography>
              <Slider
                value={project.global.tint.g}
                onChange={handleTintChange('g')}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                sx={{ color: 'success.main' }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="info.main">
                Blue
              </Typography>
              <Slider
                value={project.global.tint.b}
                onChange={handleTintChange('b')}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                sx={{ color: 'info.main' }}
              />
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            height: 50,
            backgroundColor: `rgb(${Math.round(project.global.tint.r * 255)}, ${Math.round(
              project.global.tint.g * 255
            )}, ${Math.round(project.global.tint.b * 255)})`,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Stack>
    </Paper>
  );
};