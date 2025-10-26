# Projection Mapper

Open-source projection mapping software for artists, creators, and developers. Create dynamic projections without expensive proprietary software licenses.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## Features

### Core Functionality
- **Multi-display Output** - Select any connected display/projector as output
- **4-Point Geometric Calibration** - Drag corners to match physical surfaces
- **Layer System** - Stack images, videos, and colors with blend modes
- **Real-time Preview** - See changes instantly as you work
- **Global Controls** - Master intensity and color tint adjustments
- **Project Management** - Save/load projects as JSON files

### Media Support
- **Images** - JPG, PNG, GIF formats
- **Videos** - MP4, WebM, MOV with playback controls
- **Colors** - Solid color layers with full RGBA control
- **Shaders** - (Coming soon) Custom GLSL shaders

### Remote Control
- **WebSocket API** - Control via external applications on port 8080
- **OSC Support** - (Coming soon) Integration with VJ/music software
- **MIDI Control** - (Coming soon) Map parameters to MIDI controllers

## Installation

### Quick Start

1. Download the latest release for your platform from [Releases](https://github.com/Antonio-MS-Coder/Projection-Mapper/releases)
2. Run the installer or extract the portable version
3. Launch Projection Mapper

### Build from Source

```bash
# Clone the repository
git clone https://github.com/Antonio-MS-Coder/Projection-Mapper.git
cd Projection-Mapper

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Create distributable
npm run dist
```

## Usage Guide

### Basic Workflow

1. **Connect Projector** - Connect your projector as an extended display
2. **Select Output** - Choose your projector from the Display Selector panel
3. **Create Geometry** - Click the "+" button to add a new projection surface
4. **Calibrate** - Enable calibration mode and drag the corner points to match your physical surface
5. **Add Layers** - Add image, video, or color layers to your geometry
6. **Adjust** - Fine-tune opacity, blend modes, and global settings
7. **Save Project** - Save your setup as a JSON file for later use

### Keyboard Shortcuts

- `Cmd/Ctrl + N` - New project
- `Cmd/Ctrl + O` - Open project
- `Cmd/Ctrl + S` - Save project
- `Cmd/Ctrl + Shift + S` - Save project as...
- `F11` - Toggle fullscreen output
- `Space` - Play/pause media

### WebSocket API

Connect to `ws://localhost:8080` to control the application remotely.

#### Available Commands

```javascript
// Load a project
{
  "type": "project.load",
  "payload": { "path": "/path/to/project.json" }
}

// Update layer properties
{
  "type": "layer.update",
  "payload": {
    "id": "layer-id",
    "updates": { "opacity": 0.5, "visible": true }
  }
}

// Update global settings
{
  "type": "global.update",
  "payload": { "intensity": 0.8, "tint": { "r": 1, "g": 0.5, "b": 0.5 } }
}

// Seek video timeline
{
  "type": "timeline.seek",
  "payload": { "layerId": "video-layer-id", "time": 30.5 }
}
```

## Project Structure

```
projection-mapper/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React UI application
│   │   ├── components/ # UI components
│   │   ├── engine/     # WebGL2 rendering engine
│   │   ├── stores/     # Zustand state management
│   │   └── styles/     # CSS styles
│   └── shared/         # Shared types and utilities
├── dist/               # Build output
└── release/            # Distribution packages
```

## Development

### Technology Stack

- **Framework**: Electron + React
- **Language**: TypeScript
- **Rendering**: WebGL2
- **State Management**: Zustand
- **UI Components**: Material-UI
- **Build Tool**: Vite

### Architecture

The application follows a modular architecture:

1. **Main Process** - Handles window management, file I/O, and system integration
2. **Renderer Process** - React application for UI and preview
3. **Output Window** - Dedicated WebGL2 renderer for projection output
4. **WebSocket Server** - External control interface

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Version 0.2.0 (Q2 2024)
- [ ] Mesh warping (NxM grid distortion)
- [ ] Edge blending for multi-projector setups
- [ ] Shader editor with live preview
- [ ] Asset library management

### Version 0.3.0 (Q3 2024)
- [ ] OSC input/output support
- [ ] MIDI controller mapping
- [ ] Timeline sequencer
- [ ] Preset system

### Version 1.0.0 (Q4 2024)
- [ ] Multi-projector synchronization
- [ ] NDI/Syphon/Spout support
- [ ] Advanced color correction
- [ ] Performance optimizations

## Use Cases

- **Art Installations** - Project onto sculptures, canvases, or architectural features
- **Live Performances** - VJ sets, theater productions, concerts
- **Education** - Teaching projection mapping basics without expensive software
- **Events** - Corporate presentations, exhibitions, weddings
- **Prototyping** - Quick projection mapping experiments and tests

## System Requirements

### Minimum
- OS: Windows 10, macOS 12, Ubuntu 22.04
- Processor: Dual-core 2.0 GHz
- Memory: 4 GB RAM
- Graphics: WebGL2 compatible GPU
- Storage: 200 MB available space

### Recommended
- OS: Latest Windows, macOS, or Linux
- Processor: Quad-core 3.0 GHz
- Memory: 8 GB RAM
- Graphics: Dedicated GPU with 2GB VRAM
- Storage: 1 GB available space

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by MadMapper, Resolume, and TouchDesigner
- Built with open-source technologies
- Community-driven development

## Support

- **Documentation**: [Wiki](https://github.com/Antonio-MS-Coder/Projection-Mapper/wiki)
- **Issues**: [GitHub Issues](https://github.com/Antonio-MS-Coder/Projection-Mapper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Antonio-MS-Coder/Projection-Mapper/discussions)
- **Email**: support@projectionmapper.org

---

Made with ❤️ by the open-source community