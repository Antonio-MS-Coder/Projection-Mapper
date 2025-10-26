import React from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar as MuiToolbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Fullscreen,
  GridOn,
  Tune,
  Save,
  FolderOpen,
  Add,
} from '@mui/icons-material';
import { useProjectStore } from '../stores/useProjectStore';

interface ToolbarProps {
  onCalibrate: () => void;
  calibrationMode: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onCalibrate, calibrationMode }) => {
  const { project, isDirty, addGeometry, addLayer } = useProjectStore();
  const [playing, setPlaying] = React.useState(false);

  const handlePlayPause = () => {
    setPlaying(!playing);
    // Update all video layers
    project.layers.forEach((layer) => {
      if (layer.type === 'video') {
        useProjectStore.getState().updateLayer(layer.id, { playing: !playing });
      }
    });
  };

  const handleStop = () => {
    setPlaying(false);
    // Stop and reset all video layers
    project.layers.forEach((layer) => {
      if (layer.type === 'video') {
        useProjectStore
          .getState()
          .updateLayer(layer.id, { playing: false, currentTime: 0 });
      }
    });
  };

  const handleFullscreen = () => {
    if (window.electronAPI) {
      // Toggle fullscreen on output window
      // This would be handled by the main process
    }
  };

  const handleAddGeometry = () => {
    const geometryId = addGeometry();
    // Automatically add a color layer for the new geometry
    addLayer('color', geometryId);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
      <MuiToolbar>
        <Typography variant="h6" sx={{ mr: 4 }}>
          Projection Mapper
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Tooltip title="New Geometry">
            <IconButton onClick={handleAddGeometry} size="small">
              <Add />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: 1, height: 24, backgroundColor: 'divider', mx: 1 }} />

          <Tooltip title={playing ? 'Pause' : 'Play'}>
            <IconButton onClick={handlePlayPause} size="small">
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Stop">
            <IconButton onClick={handleStop} size="small">
              <Stop />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: 1, height: 24, backgroundColor: 'divider', mx: 1 }} />

          <ToggleButtonGroup
            value={calibrationMode ? 'calibrate' : ''}
            exclusive
            onChange={() => onCalibrate()}
            size="small"
          >
            <ToggleButton value="calibrate">
              <Tooltip title="Calibration Mode">
                <GridOn />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Fullscreen Output">
            <IconButton onClick={handleFullscreen} size="small">
              <Fullscreen />
            </IconButton>
          </Tooltip>
        </Box>

        {isDirty && (
          <Typography variant="caption" sx={{ mr: 2, color: 'warning.main' }}>
            Unsaved Changes
          </Typography>
        )}
      </MuiToolbar>
    </AppBar>
  );
};