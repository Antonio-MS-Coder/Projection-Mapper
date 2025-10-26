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
} from '@mui/material';
import { Monitor, DesktopWindows } from '@mui/icons-material';
import { useProjectStore } from '../stores/useProjectStore';

export const DisplaySelector: React.FC = () => {
  const { displays, outputDisplay, selectOutputDisplay, project } = useProjectStore();
  const [selectedDisplayId, setSelectedDisplayId] = React.useState<string>('');

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
      <Typography variant="h6" gutterBottom>
        Output Display
      </Typography>

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
            {displays.map((display) => (
              <MenuItem key={display.id} value={display.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {display.isInternal ? <Monitor /> : <DesktopWindows />}
                  <Typography>
                    {display.name} ({display.bounds.width}x{display.bounds.height})
                  </Typography>
                  {display.isPrimary && <Chip label="Primary" size="small" />}
                </Stack>
              </MenuItem>
            ))}
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