import { useEffect } from 'react';
import { useProjectStore } from '../stores/useProjectStore';

interface ShortcutHandlers {
  onToggleCalibration?: () => void;
  onTogglePlayback?: () => void;
  onToggleFullscreen?: () => void;
  onSaveProject?: () => void;
  onOpenProject?: () => void;
  onNewProject?: () => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onToggleVisibility?: () => void;
  onResetCalibration?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const {
    selectedLayerId,
    selectedGeometryId,
    updateLayer,
    updateGeometry,
    deleteLayer,
    deleteGeometry,
    addLayer,
    addGeometry,
    project,
  } = useProjectStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isCmd = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // File operations
      if (isCmd && !isShift) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handlers.onSaveProject?.();
            break;
          case 'o':
            e.preventDefault();
            handlers.onOpenProject?.();
            break;
          case 'n':
            e.preventDefault();
            handlers.onNewProject?.();
            break;
          case 'd':
            e.preventDefault();
            handlers.onDuplicateSelected?.();
            break;
        }
      }

      // File operations with Shift
      if (isCmd && isShift) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            // Save As
            handlers.onSaveProject?.();
            break;
        }
      }

      // Playback controls
      if (!isCmd && !isShift && !isAlt) {
        switch (e.key.toLowerCase()) {
          case ' ': // Spacebar
            e.preventDefault();
            handlers.onTogglePlayback?.();
            break;
          case 'c':
            handlers.onToggleCalibration?.();
            break;
          case 'f':
            handlers.onToggleFullscreen?.();
            break;
          case 'h':
            handlers.onToggleVisibility?.();
            toggleVisibility();
            break;
          case 'delete':
          case 'backspace':
            e.preventDefault();
            deleteSelected();
            break;
          case 'r':
            if (isCmd) {
              e.preventDefault();
              handlers.onResetCalibration?.();
            }
            break;
        }
      }

      // Number keys for opacity (1-9 = 10%-90%, 0 = 100%)
      if (!isCmd && !isShift && !isAlt) {
        if (e.key >= '0' && e.key <= '9') {
          const opacity = e.key === '0' ? 1 : parseInt(e.key) * 0.1;
          setSelectedOpacity(opacity);
        }
      }

      // Arrow keys for nudging (with Shift for larger movements)
      if (selectedGeometryId || selectedLayerId) {
        const nudgeAmount = isShift ? 0.01 : 0.001;
        let dx = 0, dy = 0;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            dy = nudgeAmount;
            break;
          case 'ArrowDown':
            e.preventDefault();
            dy = -nudgeAmount;
            break;
          case 'ArrowLeft':
            e.preventDefault();
            dx = -nudgeAmount;
            break;
          case 'ArrowRight':
            e.preventDefault();
            dx = nudgeAmount;
            break;
        }

        if (dx !== 0 || dy !== 0) {
          nudgeSelected(dx, dy);
        }
      }

      // Layer shortcuts
      if (isCmd && selectedGeometryId) {
        switch (e.key.toLowerCase()) {
          case 'i':
            e.preventDefault();
            addLayer('image', selectedGeometryId);
            break;
          case 'v':
            e.preventDefault();
            addLayer('video', selectedGeometryId);
            break;
          case 'k':
            e.preventDefault();
            addLayer('color', selectedGeometryId);
            break;
        }
      }

      // Geometry shortcuts
      if (isCmd && e.key === 'g') {
        e.preventDefault();
        addGeometry();
      }
    };

    const toggleVisibility = () => {
      if (selectedLayerId) {
        const layer = project.layers.find(l => l.id === selectedLayerId);
        if (layer) {
          updateLayer(selectedLayerId, { visible: !layer.visible });
        }
      } else if (selectedGeometryId) {
        const geometry = project.geometries.find(g => g.id === selectedGeometryId);
        if (geometry) {
          updateGeometry(selectedGeometryId, { visible: !geometry.visible });
        }
      }
    };

    const deleteSelected = () => {
      if (selectedLayerId) {
        deleteLayer(selectedLayerId);
      } else if (selectedGeometryId) {
        deleteGeometry(selectedGeometryId);
      }
    };

    const setSelectedOpacity = (opacity: number) => {
      if (selectedLayerId) {
        updateLayer(selectedLayerId, { opacity });
      }
    };

    const nudgeSelected = (dx: number, dy: number) => {
      if (selectedLayerId) {
        const layer = project.layers.find(l => l.id === selectedLayerId);
        if (layer) {
          updateLayer(selectedLayerId, {
            transform: {
              ...layer.transform,
              position: {
                x: layer.transform.position.x + dx,
                y: layer.transform.position.y + dy,
                z: layer.transform.position.z,
              },
            },
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedLayerId,
    selectedGeometryId,
    updateLayer,
    updateGeometry,
    deleteLayer,
    deleteGeometry,
    addLayer,
    addGeometry,
    project,
    handlers,
  ]);
}

// Export keyboard shortcut definitions for UI display
export const KEYBOARD_SHORTCUTS = {
  file: [
    { keys: ['⌘', 'N'], description: 'New Project' },
    { keys: ['⌘', 'O'], description: 'Open Project' },
    { keys: ['⌘', 'S'], description: 'Save Project' },
    { keys: ['⌘', '⇧', 'S'], description: 'Save Project As' },
  ],
  playback: [
    { keys: ['Space'], description: 'Play/Pause' },
    { keys: ['F'], description: 'Toggle Fullscreen' },
  ],
  calibration: [
    { keys: ['C'], description: 'Toggle Calibration Mode' },
    { keys: ['R'], description: 'Reset Calibration' },
  ],
  editing: [
    { keys: ['Delete'], description: 'Delete Selected' },
    { keys: ['⌘', 'D'], description: 'Duplicate Selected' },
    { keys: ['H'], description: 'Toggle Visibility' },
    { keys: ['↑', '↓', '←', '→'], description: 'Nudge Position' },
    { keys: ['⇧', '↑', '↓', '←', '→'], description: 'Nudge Position (Large)' },
  ],
  opacity: [
    { keys: ['1-9'], description: 'Set Opacity (10%-90%)' },
    { keys: ['0'], description: 'Set Opacity to 100%' },
  ],
  layers: [
    { keys: ['⌘', 'G'], description: 'Add Geometry' },
    { keys: ['⌘', 'I'], description: 'Add Image Layer' },
    { keys: ['⌘', 'V'], description: 'Add Video Layer' },
    { keys: ['⌘', 'K'], description: 'Add Color Layer' },
  ],
};