# Getting Started with Projection Mapper

## Installation

La instalación ya está completa. Has instalado todas las dependencias necesarias con `npm install`.

## Ejecutar en Modo Desarrollo

Para iniciar la aplicación en modo desarrollo:

```bash
npm run dev
```

Esto iniciará:
1. **Vite** en http://localhost:3000 para el servidor de desarrollo React
2. **Electron** que abrirá una ventana con la aplicación

### Nota sobre macOS
Es posible que veas errores de certificado como:
```
ERROR:trust_store_mac.cc(750)] Error parsing certificate
```
Esto es normal en macOS y no afecta el funcionamiento de la aplicación.

## Uso Básico

### 1. Ventana Principal
Cuando se abra Electron, verás:
- **Panel principal**: Vista previa del canvas
- **Panel lateral derecho**: Controles de capas y configuración
- **Barra de herramientas superior**: Controles de reproducción y calibración

### 2. Crear tu Primera Proyección
1. Haz clic en el botón **"+"** en la barra de herramientas para añadir una nueva geometría
2. Activa el **Modo de Calibración** (ícono de grid)
3. Arrastra los 4 puntos de las esquinas para ajustar a tu superficie
4. Añade una capa (Image, Video, o Color) desde el panel de capas

### 3. Seleccionar Pantalla de Salida
1. En el panel "Output Display", selecciona tu proyector
2. Se abrirá una ventana fullscreen en ese display
3. Todo lo que configures se proyectará en tiempo real

## Comandos Disponibles

```bash
# Desarrollo
npm run dev                 # Iniciar en modo desarrollo
npm run dev:vite           # Solo el servidor Vite
npm run dev:electron-simple # Solo Electron

# Construcción
npm run build              # Construir para producción
npm run dist               # Crear ejecutable distribuible

# Otros
npm run lint               # Verificar código
npm run compile            # Compilar TypeScript
```

## Solución de Problemas

### La aplicación no se abre
1. Asegúrate de que el puerto 3000 no esté en uso
2. Cierra todos los procesos de Electron anteriores
3. Ejecuta `npm run dev` nuevamente

### No puedo ver mi proyector
1. Asegúrate de que el proyector esté conectado como pantalla extendida
2. Actualiza la lista de displays en el panel "Output Display"
3. En macOS: Ve a Preferencias del Sistema > Pantallas

### Los videos no se reproducen
1. Usa formatos compatibles: MP4 o WebM
2. Asegúrate de que el archivo tenga la ruta correcta
3. Verifica que el video no esté corrupto

## Control Remoto vía WebSocket

La aplicación expone un servidor WebSocket en `ws://localhost:8080`.

Ejemplo de conexión:
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  // Actualizar intensidad global
  ws.send(JSON.stringify({
    type: 'global.update',
    payload: { intensity: 0.8 }
  }));
};
```

## Próximos Pasos

1. **Experimenta** con diferentes geometrías y capas
2. **Guarda tu proyecto** con Cmd/Ctrl + S
3. **Lee la documentación** completa en README.md
4. **Reporta bugs** en GitHub Issues

## Recursos

- [Documentación completa](README.md)
- [Guía de contribución](CONTRIBUTING.md)
- [GitHub Repository](https://github.com/Antonio-MS-Coder/Projection-Mapper)

---

¡Disfruta creando con Projection Mapper! 🎨✨