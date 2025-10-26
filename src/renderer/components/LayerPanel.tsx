import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Checkbox,
  Slider,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import {
  Delete,
  DragIndicator,
  Image,
  Movie,
  Palette,
  Code,
  AutoAwesome,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjectStore } from '../stores/useProjectStore';
import { Layer, BlendMode } from '@shared/types';

const LayerItem: React.FC<{ layer: Layer }> = ({ layer }) => {
  const { updateLayer, deleteLayer, selectLayer, selectedLayerId } = useProjectStore();
  const isSelected = selectedLayerId === layer.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = () => {
    switch (layer.type) {
      case 'image':
        return <Image />;
      case 'video':
        return <Movie />;
      case 'color':
        return <Palette />;
      case 'shader':
        return <Code />;
      case 'pattern':
        return <AutoAwesome />;
      default:
        return null;
    }
  };

  const handleMediaSelect = async () => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.selectMedia();
    if (!result.canceled && result.filePaths[0]) {
      updateLayer(layer.id, { source: result.filePaths[0] });
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
        border: isSelected ? '1px solid' : '1px solid transparent',
        borderColor: 'primary.main',
      }}
      onClick={() => selectLayer(layer.id)}
    >
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={1}>
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                updateLayer(layer.id, { visible: !layer.visible });
              }}
            >
              {layer.visible ? <Visibility /> : <VisibilityOff />}
            </IconButton>
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                deleteLayer(layer.id);
              }}
            >
              <Delete />
            </IconButton>
          </Stack>
        }
      >
        <ListItemIcon
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', minWidth: 40 }}
        >
          <DragIndicator />
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 40 }}>{getIcon()}</ListItemIcon>
        <ListItemText primary={layer.name} />
      </ListItem>

      {isSelected && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption">Opacity</Typography>
              <Slider
                value={layer.opacity}
                onChange={(_, value) => updateLayer(layer.id, { opacity: value as number })}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="caption">Blend Mode</Typography>
              <Select
                value={layer.blendMode}
                onChange={(e) =>
                  updateLayer(layer.id, { blendMode: e.target.value as BlendMode })
                }
                size="small"
                fullWidth
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="add">Add</MenuItem>
                <MenuItem value="multiply">Multiply</MenuItem>
                <MenuItem value="screen">Screen</MenuItem>
              </Select>
            </Box>

            {(layer.type === 'image' || layer.type === 'video') && (
              <Box>
                <Typography variant="caption">Source</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleMediaSelect}
                >
                  {layer.source || 'Select Media...'}
                </Button>
              </Box>
            )}

            {layer.type === 'video' && (
              <>
                <Box>
                  <Typography variant="caption">Loop</Typography>
                  <Checkbox
                    checked={layer.loop}
                    onChange={(e) => updateLayer(layer.id, { loop: e.target.checked })}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption">Volume</Typography>
                  <Slider
                    value={layer.volume}
                    onChange={(_, value) =>
                      updateLayer(layer.id, { volume: value as number })
                    }
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Box>
              </>
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export const LayerPanel: React.FC = () => {
  const { project, addLayer, selectedGeometryId } = useProjectStore();

  const handleAddLayer = (type: Layer['type']) => {
    if (!selectedGeometryId) {
      alert('Please select or create a geometry first');
      return;
    }
    addLayer(type, selectedGeometryId);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Layers
      </Typography>

      <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Image />}
            onClick={() => handleAddLayer('image')}
          >
            Image
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Movie />}
            onClick={() => handleAddLayer('video')}
          >
            Video
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Palette />}
            onClick={() => handleAddLayer('color')}
          >
            Color
          </Button>
        </Stack>
        <Button
          size="small"
          variant="contained"
          startIcon={<AutoAwesome />}
          onClick={() => handleAddLayer('pattern')}
          sx={{ backgroundColor: 'primary.dark' }}
        >
          Light Pattern
        </Button>
      </Stack>

      <List sx={{ p: 0 }}>
        {project.layers.map((layer) => (
          <LayerItem key={layer.id} layer={layer} />
        ))}
      </List>

      {project.layers.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No layers yet. Add a layer to get started.
        </Typography>
      )}
    </Box>
  );
};