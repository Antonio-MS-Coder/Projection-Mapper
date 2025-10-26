import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  TextField,
  Button,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  Add,
  Delete,
  MoreVert,
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
  Palette,
  Group,
  Ungroup,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { Layer, LayerGroup } from '@shared/types';
import { useProjectStore } from '../stores/useProjectStore';

const GROUP_COLORS = [
  { name: 'Red', value: '#ff4444' },
  { name: 'Orange', value: '#ff8844' },
  { name: 'Yellow', value: '#ffcc44' },
  { name: 'Green', value: '#44ff44' },
  { name: 'Blue', value: '#4444ff' },
  { name: 'Purple', value: '#ff44ff' },
  { name: 'Cyan', value: '#44ffff' },
  { name: 'White', value: '#ffffff' },
];

interface GroupItemProps {
  group: LayerGroup;
  layers: Layer[];
  onUpdate: (id: string, updates: Partial<LayerGroup>) => void;
  onDelete: (id: string) => void;
  onAddLayerToGroup: (layerId: string, groupId: string) => void;
  onRemoveLayerFromGroup: (layerId: string) => void;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  layers,
  onUpdate,
  onDelete,
  onAddLayerToGroup,
  onRemoveLayerFromGroup,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(group.name);

  const groupLayers = layers.filter((l) => l.groupId === group.id);

  const handleRename = () => {
    onUpdate(group.id, { name: newName });
    setIsRenaming(false);
  };

  const handleColorSelect = (color: string) => {
    onUpdate(group.id, { color });
    setColorMenuAnchor(null);
  };

  return (
    <Paper
      sx={{
        mb: 1,
        backgroundColor: 'background.paper',
        borderLeft: '3px solid',
        borderColor: group.color || 'primary.main',
      }}
    >
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onUpdate(group.id, { visible: !group.visible })}
            >
              {group.visible ? <Visibility /> : <VisibilityOff />}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onUpdate(group.id, { locked: !group.locked })}
            >
              {group.locked ? <Lock /> : <LockOpen />}
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
          </Stack>
        }
      >
        <ListItemIcon>
          <IconButton
            size="small"
            onClick={() => onUpdate(group.id, { expanded: !group.expanded })}
          >
            {group.expanded ? <FolderOpen /> : <Folder />}
          </IconButton>
        </ListItemIcon>
        <ListItemText
          primary={
            isRenaming ? (
              <TextField
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                size="small"
                autoFocus
                fullWidth
              />
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  onDoubleClick={() => setIsRenaming(true)}
                >
                  {group.name}
                </Typography>
                <Chip
                  label={`${groupLayers.length} layers`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            )
          }
          secondary={
            <Typography variant="caption" color="text.secondary">
              Opacity: {Math.round(group.opacity * 100)}%
            </Typography>
          }
        />
      </ListItem>

      <Collapse in={group.expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
          {groupLayers.length > 0 ? (
            <List dense>
              {groupLayers.map((layer) => (
                <ListItem
                  key={layer.id}
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={() => onRemoveLayerFromGroup(layer.id)}
                    >
                      <Ungroup />
                    </IconButton>
                  }
                >
                  <ListItemText primary={layer.name} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              Drag layers here to group them
            </Typography>
          )}
        </Box>
      </Collapse>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setIsRenaming(true)}>
          Rename
        </MenuItem>
        <MenuItem onClick={(e) => setColorMenuAnchor(e.currentTarget)}>
          <ListItemIcon>
            <Palette />
          </ListItemIcon>
          Change Color
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            groupLayers.forEach((layer) => onRemoveLayerFromGroup(layer.id));
            setAnchorEl(null);
          }}
        >
          Ungroup All
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(group.id);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          Delete Group
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={colorMenuAnchor}
        open={Boolean(colorMenuAnchor)}
        onClose={() => setColorMenuAnchor(null)}
      >
        {GROUP_COLORS.map((color) => (
          <MenuItem
            key={color.value}
            onClick={() => handleColorSelect(color.value)}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: color.value,
                borderRadius: 1,
                mr: 2,
              }}
            />
            {color.name}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

export const LayerGroups: React.FC = () => {
  const { project } = useProjectStore();
  const [groups, setGroups] = useState<LayerGroup[]>([]);

  const handleCreateGroup = () => {
    const newGroup: LayerGroup = {
      id: `group-${Date.now()}`,
      name: `Group ${groups.length + 1}`,
      expanded: true,
      visible: true,
      locked: false,
      opacity: 1,
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length].value,
    };
    setGroups([...groups, newGroup]);
  };

  const handleUpdateGroup = (id: string, updates: Partial<LayerGroup>) => {
    setGroups(groups.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const handleDeleteGroup = (id: string) => {
    // Remove group reference from all layers
    project.layers.forEach((layer) => {
      if (layer.groupId === id) {
        useProjectStore.getState().updateLayer(layer.id, { groupId: undefined });
      }
    });
    setGroups(groups.filter((g) => g.id !== id));
  };

  const handleAddLayerToGroup = (layerId: string, groupId: string) => {
    useProjectStore.getState().updateLayer(layerId, { groupId });
  };

  const handleRemoveLayerFromGroup = (layerId: string) => {
    useProjectStore.getState().updateLayer(layerId, { groupId: undefined });
  };

  const ungroupedLayers = project.layers.filter((l) => !l.groupId);

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Layer Groups</Typography>
        <Button
          startIcon={<Add />}
          variant="outlined"
          size="small"
          onClick={handleCreateGroup}
        >
          New Group
        </Button>
      </Box>

      <List sx={{ p: 0 }}>
        {groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            layers={project.layers}
            onUpdate={handleUpdateGroup}
            onDelete={handleDeleteGroup}
            onAddLayerToGroup={handleAddLayerToGroup}
            onRemoveLayerFromGroup={handleRemoveLayerFromGroup}
          />
        ))}
      </List>

      {groups.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Create groups to organize your layers
        </Typography>
      )}

      {ungroupedLayers.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Ungrouped Layers ({ungroupedLayers.length})
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {ungroupedLayers.map((layer) => (
              <Chip
                key={layer.id}
                label={layer.name}
                size="small"
                onDelete={() => {
                  if (groups.length > 0) {
                    handleAddLayerToGroup(layer.id, groups[0].id);
                  }
                }}
                deleteIcon={<Group />}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};