import React, { useEffect, useRef } from 'react';

interface OrbShaderCanvasProps {
  isSpeaking?: boolean;
  isListening?: boolean;
}

export const OrbShaderCanvas: React.FC<OrbShaderCanvasProps> = ({ isSpeaking, isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 500;
      const h = canvas.clientHeight || 500;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_activity;

#define PI 3.14159265359

void main() {
    vec2 uv = v_texCoord * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float d = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Base ring radius
    float ringRadius = 0.4;
    
    // Dynamic wave displacement for "speaking" or "listening" state
    float speechPulse = (0.5 + 0.5 * sin(u_time * 4.0)) * (0.8 + u_activity * 1.2);
    float freq = 10.0 + u_activity * 6.0;
    float amp = 0.04 * speechPulse;
    float wave = sin(angle * freq + u_time * 8.0) * amp;
    
    // Multiple concentric rings with varying motion
    float ring1 = 0.002 / (abs(d - (ringRadius + wave)) + 0.005);
    float ring2 = 0.0015 / (abs(d - (ringRadius + 0.08 + wave * 0.6)) + 0.008);
    float ring3 = 0.001 / (abs(d - (ringRadius - 0.08 + wave * 0.4)) + 0.01);
    
    // Outer energy shells
    float shell = 0.001 / (abs(d - (ringRadius + 0.2 + 0.02 * sin(u_time * 2.0))) + 0.02);
    
    // Neon Cyan / Electric Blue Palette
    vec3 cyan = vec3(0.0, 0.95, 1.0);
    vec3 blue = vec3(0.0, 0.4, 1.0);
    
    // Mix colors based on distance and time
    vec3 color = mix(cyan, blue, d * 0.5 + 0.5 * sin(u_time));
    
    // Combine layers
    float finalMask = ring1 + ring2 + ring3 + shell;
    
    // Center glow
    float center = 0.02 / (d + 0.1);
    center *= (0.8 + 0.2 * sin(u_time * 15.0) + u_activity * 0.5);
    
    vec3 finalColor = color * (finalMask + center * 0.5);
    
    // Subtle scanlines
    float scanline = sin(uv.y * 200.0 + u_time * 5.0) * 0.02 + 0.98;
    finalColor *= scanline;
    
    // Vignette
    finalColor *= smoothstep(1.5, 0.5, d);
    
    gl_FragColor = vec4(finalColor, clamp(length(finalColor), 0.0, 1.0));
}`;

    function cs(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const vertShader = cs(gl.VERTEX_SHADER, vs);
    const fragShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uActivity = gl.getUniformLocation(prog, 'u_activity');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    function render(t: number) {
      if (!canvas || !gl) return;
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uActivity) gl.uniform1f(uActivity, isSpeaking || isListening ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isSpeaking, isListening]);

  return (
    <canvas
      ref={canvasRef}
      id="shader-canvas-ANIMATION_23"
      className="w-full h-full block rounded-full"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};
