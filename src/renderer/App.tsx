import React, { useEffect, useRef } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useProjectStore } from './stores/useProjectStore';
import { MainLayout } from './components/MainLayout';
import { Canvas } from './components/Canvas';
import { LayerPanel } from './components/LayerPanel';
import { ControlPanel } from './components/ControlPanel';
import { Toolbar } from './components/Toolbar';
import { DisplaySelector } from './components/DisplaySelector';
import { CalibrationOverlay } from './components/CalibrationOverlay';
import './styles/app.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
    },
    secondary: {
      main: '#ff0088',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

declare global {
  interface Window {
    electronAPI: any;
  }
}

function App() {
  const {
    project,
    loadProject,
    setProjectPath,
    markClean,
    setDisplays,
    selectOutputDisplay,
  } = useProjectStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [calibrationMode, setCalibrationMode] = React.useState(false);

  useEffect(() => {
    // Load available displays
    if (window.electronAPI) {
      window.electronAPI.getDisplays().then(setDisplays);

      // Listen for menu actions
      window.electronAPI.onMenuAction((action: string, data?: any) => {
        switch (action) {
          case 'newProject':
            if (confirm('Create new project? Unsaved changes will be lost.')) {
              useProjectStore.getState().newProject();
            }
            break;
          case 'openProject':
            if (data) {
              loadProjectFile(data);
            }
            break;
          case 'saveProject':
            saveProject();
            break;
          case 'saveProjectAs':
            saveProjectAs();
            break;
          case 'resetCalibration':
            resetCalibration();
            break;
        }
      });

      // Listen for WebSocket messages
      window.electronAPI.onWSMessage((message: any) => {
        handleWSMessage(message);
      });
    }
  }, []);

  const loadProjectFile = async (path: string) => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.loadProject(path);
    if (result.success) {
      loadProject(result.project);
      setProjectPath(path);
      markClean();
    } else {
      alert(`Failed to load project: ${result.error}`);
    }
  };

  const saveProject = async () => {
    const currentPath = useProjectStore.getState().currentProjectPath;
    if (currentPath) {
      await saveProjectToPath(currentPath);
    } else {
      await saveProjectAs();
    }
  };

  const saveProjectAs = async () => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.showSaveDialog();
    if (!result.canceled && result.filePath) {
      await saveProjectToPath(result.filePath);
    }
  };

  const saveProjectToPath = async (path: string) => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.saveProject(path, project);
    if (result.success) {
      setProjectPath(path);
      markClean();
    } else {
      alert(`Failed to save project: ${result.error}`);
    }
  };

  const resetCalibration = () => {
    // Reset all geometries to default positions
    project.geometries.forEach((geometry) => {
      const defaultPoints = [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: 0.5 },
        { x: -0.5, y: 0.5 },
      ];

      defaultPoints.forEach((point, index) => {
        useProjectStore
          .getState()
          .updateGeometryPoint(geometry.id, index, point);
      });
    });
  };

  const handleWSMessage = (message: any) => {
    switch (message.type) {
      case 'project.load':
        loadProjectFile(message.payload.path);
        break;
      case 'layer.update':
        useProjectStore
          .getState()
          .updateLayer(message.payload.id, message.payload.updates);
        break;
      case 'global.update':
        useProjectStore.getState().updateGlobalSettings(message.payload);
        break;
      case 'timeline.seek':
        // Handle timeline seek for videos
        const layer = project.layers.find((l) => l.id === message.payload.layerId);
        if (layer && layer.type === 'video') {
          useProjectStore
            .getState()
            .updateLayer(layer.id, { currentTime: message.payload.time });
        }
        break;
    }
  };

  const handleLayerReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = project.layers.findIndex((l) => l.id === active.id);
      const newIndex = project.layers.findIndex((l) => l.id === over.id);

      const newOrder = [...project.layers];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);

      useProjectStore.getState().reorderLayers(newOrder.map((l) => l.id));
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <DndContext onDragEnd={handleLayerReorder}>
        <MainLayout>
          <Toolbar
            onCalibrate={() => setCalibrationMode(!calibrationMode)}
            calibrationMode={calibrationMode}
          />
          <div className="main-content">
            <div className="canvas-container">
              <Canvas ref={canvasRef} />
              {calibrationMode && (
                <CalibrationOverlay canvasRef={canvasRef} />
              )}
            </div>
            <div className="side-panel">
              <DisplaySelector />
              <SortableContext
                items={project.layers.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <LayerPanel />
              </SortableContext>
              <ControlPanel />
            </div>
          </div>
        </MainLayout>
      </DndContext>
    </ThemeProvider>
  );
}

export default App;