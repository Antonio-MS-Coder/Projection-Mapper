import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Monitor, DesktopWindows, Refresh, Videocam } from '@mui/icons-material';
import { useProjectStore } from '../stores/useProjectStore';

export const DisplaySelector: React.FC = () => {
  const { displays, outputDisplay, selectOutputDisplay, project, setDisplays } = useProjectStore();
  const [selectedDisplayId, setSelectedDisplayId] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshDisplays = async () => {
    setIsLoading(true);
    if (window.electronAPI) {
      const newDisplays = await window.electronAPI.getDisplays();
      setDisplays(newDisplays);
      console.log('Refreshed displays:', newDisplays);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Load displays on mount
    refreshDisplays();
  }, []);

  useEffect(() => {
    if (project.global.outputDisplayId) {
      setSelectedDisplayId(project.global.outputDisplayId);
    }
  }, [project.global.outputDisplayId]);

  const handleDisplaySelect = (displayId: string) => {
    setSelectedDisplayId(displayId);
    const display = displays.find((d) => d.id === displayId);
    if (display) {
      selectOutputDisplay(display);
      if (window.electronAPI) {
        window.electronAPI.selectOutputDisplay(displayId);
      }
    }
  };

  const handleCloseOutput = () => {
    if (window.electronAPI) {
      window.electronAPI.closeOutputWindow();
    }
    setSelectedDisplayId('');
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Output Display
        </Typography>
        <Tooltip title="Refresh displays">
          <IconButton onClick={refreshDisplays} disabled={isLoading} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Select Display</InputLabel>
          <Select
            value={selectedDisplayId}
            onChange={(e) => handleDisplaySelect(e.target.value)}
            label="Select Display"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {displays.map((display) => {
              const isProjector = !display.isInternal && !display.isPrimary;
              return (
                <MenuItem key={display.id} value={display.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {display.isInternal ? <Monitor /> : isProjector ? <Videocam /> : <DesktopWindows />}
                    <Typography>{display.name}</Typography>
                    {display.isPrimary && <Chip label="Primary" size="small" color="primary" />}
                    {isProjector && <Chip label="Projector" size="small" color="secondary" />}
                  </Stack>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {outputDisplay && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Current Output
            </Typography>
            <Typography variant="body2">
              {outputDisplay.name} - {outputDisplay.bounds.width}x{outputDisplay.bounds.height}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCloseOutput}
              sx={{ mt: 1 }}
              fullWidth
            >
              Close Output Window
            </Button>
          </Box>
        )}

        {displays.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No displays detected. Please check your display connections.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};