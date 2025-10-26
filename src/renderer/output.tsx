import { ProjectionEngine } from './engine/ProjectionEngine';

// Output window renderer - receives render data from main window
class OutputRenderer {
  private engine: ProjectionEngine | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.canvas = document.getElementById('output-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      console.error('Output canvas not found');
      return;
    }

    // Set canvas size to window size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Initialize projection engine
    this.engine = new ProjectionEngine(this.canvas);

    // Listen for render updates from main window
    if (window.electronAPI) {
      window.electronAPI.onRenderUpdate((data: any) => {
        this.render(data);
      });

      // Notify main window that output is ready
      window.electronAPI.sendOutputReady();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.canvas && this.engine) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.engine.resize(window.innerWidth, window.innerHeight);
      }
    });
  }

  private render(data: any) {
    if (!this.engine) return;

    // Load any new media assets
    data.layers.forEach(async (layer: any) => {
      if (layer.type === 'image' && layer.source) {
        try {
          await this.engine.loadImage(layer.id, layer.source);
        } catch (error) {
          console.error(`Failed to load image for layer ${layer.id}:`, error);
        }
      } else if (layer.type === 'video' && layer.source) {
        try {
          const video = await this.engine.loadVideo(layer.id, layer.source);
          if (layer.playing) {
            video.play();
          } else {
            video.pause();
          }
          video.currentTime = layer.currentTime;
          video.volume = layer.volume;
          video.loop = layer.loop;
        } catch (error) {
          console.error(`Failed to load video for layer ${layer.id}:`, error);
        }
      }
    });

    // Render the frame
    this.engine.render(data.layers, data.geometries, data.global);
  }

  public destroy() {
    this.engine?.destroy();
  }
}

// Initialize output renderer
const outputRenderer = new OutputRenderer();

// Clean up on window unload
window.addEventListener('beforeunload', () => {
  outputRenderer.destroy();
});