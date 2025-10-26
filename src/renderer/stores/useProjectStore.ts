import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  Geometry,
  Layer,
  GlobalSettings,
  Display,
  QuadPoint,
  Vec2,
  Transform,
  Color,
} from '@shared/types';

interface ProjectStore {
  project: Project;
  selectedLayerId: string | null;
  selectedGeometryId: string | null;
  currentProjectPath: string | null;
  isDirty: boolean;
  displays: Display[];
  outputDisplay: Display | null;

  // Project actions
  newProject: () => void;
  loadProject: (project: Project) => void;
  setProjectPath: (path: string) => void;
  markDirty: () => void;
  markClean: () => void;

  // Display actions
  setDisplays: (displays: Display[]) => void;
  selectOutputDisplay: (display: Display) => void;

  // Geometry actions
  addGeometry: (name?: string) => string;
  updateGeometry: (id: string, updates: Partial<Geometry>) => void;
  deleteGeometry: (id: string) => void;
  selectGeometry: (id: string | null) => void;
  updateGeometryPoint: (geometryId: string, pointIndex: number, position: Vec2) => void;

  // Layer actions
  addLayer: (type: Layer['type'], geometryId: string) => string;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  reorderLayers: (layerIds: string[]) => void;

  // Global settings
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
}

const defaultTransform: Transform = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

const defaultQuadPoints = (): QuadPoint[] => [
  { id: uuidv4(), position: { x: -0.5, y: -0.5 } },
  { id: uuidv4(), position: { x: 0.5, y: -0.5 } },
  { id: uuidv4(), position: { x: 0.5, y: 0.5 } },
  { id: uuidv4(), position: { x: -0.5, y: 0.5 } },
];

const createDefaultProject = (): Project => ({
  id: uuidv4(),
  name: 'Untitled Project',
  version: '0.1.0',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  geometries: [],
  layers: [],
  groups: [],
  global: {
    intensity: 1.0,
    tint: { r: 1, g: 1, b: 1 },
    outputDisplayId: null,
  },
});

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: createDefaultProject(),
  selectedLayerId: null,
  selectedGeometryId: null,
  currentProjectPath: null,
  isDirty: false,
  displays: [],
  outputDisplay: null,

  // Project actions
  newProject: () => {
    set({
      project: createDefaultProject(),
      selectedLayerId: null,
      selectedGeometryId: null,
      currentProjectPath: null,
      isDirty: false,
    });
  },

  loadProject: (project: Project) => {
    set({
      project,
      selectedLayerId: null,
      selectedGeometryId: null,
      isDirty: false,
    });
  },

  setProjectPath: (path: string) => {
    set({ currentProjectPath: path });
  },

  markDirty: () => {
    set({ isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  // Display actions
  setDisplays: (displays: Display[]) => {
    set({ displays });
  },

  selectOutputDisplay: (display: Display) => {
    set((state) => ({
      outputDisplay: display,
      project: {
        ...state.project,
        global: {
          ...state.project.global,
          outputDisplayId: display.id,
        },
      },
      isDirty: true,
    }));
  },

  // Geometry actions
  addGeometry: (name?: string) => {
    const id = uuidv4();
    const geometry: Geometry = {
      id,
      name: name || `Geometry ${get().project.geometries.length + 1}`,
      points: defaultQuadPoints(),
      transform: { ...defaultTransform },
      visible: true,
    };

    set((state) => ({
      project: {
        ...state.project,
        geometries: [...state.project.geometries, geometry],
        modified: new Date().toISOString(),
      },
      selectedGeometryId: id,
      isDirty: true,
    }));

    return id;
  },

  updateGeometry: (id: string, updates: Partial<Geometry>) => {
    set((state) => ({
      project: {
        ...state.project,
        geometries: state.project.geometries.map((g) =>
          g.id === id ? { ...g, ...updates } : g
        ),
        modified: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },

  deleteGeometry: (id: string) => {
    set((state) => ({
      project: {
        ...state.project,
        geometries: state.project.geometries.filter((g) => g.id !== id),
        layers: state.project.layers.filter((l) => l.geometryId !== id),
        modified: new Date().toISOString(),
      },
      selectedGeometryId: state.selectedGeometryId === id ? null : state.selectedGeometryId,
      isDirty: true,
    }));
  },

  selectGeometry: (id: string | null) => {
    set({ selectedGeometryId: id });
  },

  updateGeometryPoint: (geometryId: string, pointIndex: number, position: Vec2) => {
    set((state) => ({
      project: {
        ...state.project,
        geometries: state.project.geometries.map((g) => {
          if (g.id !== geometryId) return g;
          const newPoints = [...g.points];
          newPoints[pointIndex] = { ...newPoints[pointIndex], position };
          return { ...g, points: newPoints };
        }),
        modified: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },

  // Layer actions
  addLayer: (type: Layer['type'], geometryId: string) => {
    const id = uuidv4();
    const order = get().project.layers.length;

    const baseLayer: Omit<Layer, 'type'> = {
      id,
      name: `Layer ${order + 1}`,
      geometryId,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      transform: { ...defaultTransform },
      order,
    };

    let layer: Layer;

    switch (type) {
      case 'image':
        layer = { ...baseLayer, type: 'image', source: '' } as Layer;
        break;
      case 'video':
        layer = {
          ...baseLayer,
          type: 'video',
          source: '',
          loop: true,
          playing: false,
          volume: 1,
          currentTime: 0,
          duration: 0,
        } as Layer;
        break;
      case 'color':
        layer = {
          ...baseLayer,
          type: 'color',
          color: { r: 1, g: 1, b: 1, a: 1 },
        } as Layer;
        break;
      case 'shader':
        layer = {
          ...baseLayer,
          type: 'shader',
          fragmentShader: '',
          vertexShader: undefined,
          uniforms: {},
        } as Layer;
        break;
      case 'pattern':
        layer = {
          ...baseLayer,
          type: 'pattern',
          patternId: 'solid',
          patternConfig: {
            colors: ['#00ff88'],
            fillOpacity: 1,
            borderWidth: 0,
          },
          isAnimated: false,
          isPlaying: true,
        } as Layer;
        break;
      default:
        throw new Error(`Unknown layer type: ${type}`);
    }

    set((state) => ({
      project: {
        ...state.project,
        layers: [...state.project.layers, layer],
        modified: new Date().toISOString(),
      },
      selectedLayerId: id,
      isDirty: true,
    }));

    return id;
  },

  updateLayer: (id: string, updates: Partial<Layer>) => {
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        ),
        modified: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },

  deleteLayer: (id: string) => {
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.filter((l) => l.id !== id),
        modified: new Date().toISOString(),
      },
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
      isDirty: true,
    }));
  },

  selectLayer: (id: string | null) => {
    set({ selectedLayerId: id });
  },

  reorderLayers: (layerIds: string[]) => {
    set((state) => {
      const layerMap = new Map(state.project.layers.map((l) => [l.id, l]));
      const newLayers = layerIds
        .map((id, index) => {
          const layer = layerMap.get(id);
          return layer ? { ...layer, order: index } : null;
        })
        .filter(Boolean) as Layer[];

      return {
        project: {
          ...state.project,
          layers: newLayers,
          modified: new Date().toISOString(),
        },
        isDirty: true,
      };
    });
  },

  // Global settings
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => {
    set((state) => ({
      project: {
        ...state.project,
        global: { ...state.project.global, ...settings },
        modified: new Date().toISOString(),
      },
      isDirty: true,
    }));
  },
}));