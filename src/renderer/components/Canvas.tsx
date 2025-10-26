import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import { ProjectionEngine } from '../engine/ProjectionEngine';
import { useProjectStore } from '../stores/useProjectStore';

export const Canvas = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ProjectionEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { project } = useProjectStore();

  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize projection engine
    engineRef.current = new ProjectionEngine(canvasRef.current);

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current && engineRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        engineRef.current.resize(rect.width, rect.height);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Start render loop
    const render = () => {
      if (engineRef.current) {
        engineRef.current.render(
          project.layers,
          project.geometries,
          project.global
        );

        // Send render data to output window
        if (window.electronAPI) {
          window.electronAPI.sendRenderUpdate({
            layers: project.layers,
            geometries: project.geometries,
            global: project.global,
          });
        }
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      engineRef.current?.destroy();
    };
  }, []);

  // Update render when project changes
  useEffect(() => {
    // Load media assets
    project.layers.forEach(async (layer) => {
      if (!engineRef.current) return;

      if (layer.type === 'image' && layer.source) {
        try {
          await engineRef.current.loadImage(layer.id, layer.source);
        } catch (error) {
          console.error(`Failed to load image for layer ${layer.id}:`, error);
        }
      } else if (layer.type === 'video' && layer.source) {
        try {
          const video = await engineRef.current.loadVideo(layer.id, layer.source);
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
  }, [project.layers]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Box>
  );
});