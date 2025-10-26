import { useEffect, useRef } from 'react';
import { useProjectStore } from '../stores/useProjectStore';

interface AutoSaveOptions {
  interval?: number; // Save interval in milliseconds (default: 30 seconds)
  enabled?: boolean;
  onSave?: () => Promise<void>;
}

export function useAutoSave(options: AutoSaveOptions = {}) {
  const { interval = 30000, enabled = true, onSave } = options;
  const { isDirty, project, currentProjectPath, markClean } = useProjectStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  useEffect(() => {
    if (!enabled || !isDirty || !currentProjectPath) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set up auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      const projectString = JSON.stringify(project);

      // Only save if project has actually changed
      if (projectString !== lastSaveRef.current) {
        console.log('Auto-saving project...');

        if (onSave) {
          await onSave();
        } else if (window.electronAPI && currentProjectPath) {
          const result = await window.electronAPI.saveProject(currentProjectPath, project);
          if (result.success) {
            markClean();
            lastSaveRef.current = projectString;
            console.log('Auto-save completed');
          } else {
            console.error('Auto-save failed:', result.error);
          }
        }
      }
    }, interval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, isDirty, project, currentProjectPath, interval, onSave, markClean]);

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      if (isDirty && currentProjectPath && window.electronAPI) {
        // Synchronous save on unmount
        window.electronAPI.saveProject(currentProjectPath, project);
      }
    };
  }, []);

  return {
    lastAutoSave: lastSaveRef.current ? new Date(lastSaveRef.current) : null,
  };
}