// Core types for Projection Mapper

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Transform {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

export interface QuadPoint {
  id: string;
  position: Vec2;
}

export interface Geometry {
  id: string;
  name: string;
  points: QuadPoint[]; // 4 points for homography
  transform: Transform;
  visible: boolean;
}

export type LayerType = 'image' | 'video' | 'shader' | 'color' | 'pattern';
export type BlendMode = 'normal' | 'add' | 'multiply' | 'screen';

export interface LayerBase {
  id: string;
  name: string;
  type: LayerType;
  geometryId: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  order: number;
  groupId?: string; // Optional group membership
  locked?: boolean; // Lock layer from editing
}

export interface ImageLayer extends LayerBase {
  type: 'image';
  source: string; // file path or URL
}

export interface VideoLayer extends LayerBase {
  type: 'video';
  source: string;
  loop: boolean;
  playing: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export interface ColorLayer extends LayerBase {
  type: 'color';
  color: Color;
}

export interface ShaderLayer extends LayerBase {
  type: 'shader';
  fragmentShader: string;
  vertexShader?: string;
  uniforms: Record<string, any>;
}

export interface PatternLayer extends LayerBase {
  type: 'pattern';
  patternId: string;
  patternConfig: {
    colors: string[];
    speed?: number;
    intensity?: number;
    direction?: string;
    frequency?: number;
    borderWidth?: number;
    fillOpacity?: number;
    strokeDashArray?: string;
  };
  isAnimated: boolean;
  isPlaying: boolean;
}

export type Layer = ImageLayer | VideoLayer | ColorLayer | ShaderLayer | PatternLayer;

export interface LayerGroup {
  id: string;
  name: string;
  expanded: boolean;
  visible: boolean;
  locked: boolean;
  opacity: number; // Group opacity affects all child layers
  color?: string; // Visual color coding
}

export interface GlobalSettings {
  intensity: number; // 0.0 - 1.0
  tint: Color;
  outputDisplayId: string | null;
}

export interface Project {
  id: string;
  name: string;
  version: string;
  created: string;
  modified: string;
  geometries: Geometry[];
  layers: Layer[];
  groups: LayerGroup[];
  global: GlobalSettings;
}

export interface Display {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isPrimary: boolean;
  isInternal: boolean;
}

// WebSocket API types
export interface WSMessage {
  type: string;
  payload: any;
}

export interface WSProjectLoad {
  type: 'project.load';
  payload: {
    path: string;
  };
}

export interface WSLayerUpdate {
  type: 'layer.update';
  payload: {
    id: string;
    updates: Partial<Layer>;
  };
}

export interface WSGlobalUpdate {
  type: 'global.update';
  payload: Partial<GlobalSettings>;
}

export interface WSTimelineSeek {
  type: 'timeline.seek';
  payload: {
    layerId: string;
    time: number;
  };
}