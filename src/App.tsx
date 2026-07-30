import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveTab, SystemMetrics, VoiceState, GPSLocation, LiveDisplayCard, ScreenMonitorState, SessionState } from './types';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav } from './components/BottomNav';
import { VoiceCoreView } from './components/VoiceCoreView';
import { LiveDisplayProtocolView } from './components/LiveDisplayProtocolView';
import { TerminalView } from './components/TerminalView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { NeuralTreeView } from './components/NeuralTreeView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('core');
  const [isMuted, setIsMuted] = useState(false);

  // Session Resumption State
  const [sessionState, setSessionState] = useState<SessionState>(() => {
    try {
      const saved = localStorage.getItem('JARVIS_SESSION_STATE_V2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isResuming: true,
          lastActiveAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Failed to restore session from localStorage:', e);
    }
    return {
      sessionId: `SES-${Date.now()}`,
      isResuming: false,
      tier: 'PRO_ENTERPRISE_HIGH_THROUGHPUT',
      maxOutputTokens: 65536,
      compressionEnabled: true,
      compressionRatio: '84.2% OPTIMIZED',
      compressedContextSummary: '',
      sessionStartedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
  });

  // Live Screen Monitor State
  const [screenMonitor, setScreenMonitor] = useState<ScreenMonitorState>({
    isSharing: false,
    status: 'inactive',
    lastFrameSnapshotUrl: null,
    autoAnalyzeIntervalSec: 10,
    autoAnalyzeEnabled: false,
  });

  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Capture current video frame as Base64 JPEG
  const captureScreenFrame = useCallback((): string | null => {
    if (!screenVideoRef.current || !screenStreamRef.current) return null;
    const video = screenVideoRef.current;
    if (video.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  }, []);

  // Stop Screen Share
  const handleStopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setScreenMonitor((prev) => ({
      ...prev,
      isSharing: false,
      status: 'inactive',
      lastFrameSnapshotUrl: null,
    }));
  }, []);

  // Request & Start Screen Share
  const handleStartScreenShare = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setScreenMonitor((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'Display capture is not supported in this browser context.',
        }));
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });

      screenStreamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          handleStopScreenShare();
        };
      }

      if (!screenVideoRef.current) {
        const video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        screenVideoRef.current = video;
      }
      screenVideoRef.current.srcObject = stream;
      await screenVideoRef.current.play().catch(() => {});

      setTimeout(() => {
        const frame = captureScreenFrame();
        setScreenMonitor((prev) => ({
          ...prev,
          isSharing: true,
          status: 'permission_granted',
          lastFrameSnapshotUrl: frame,
          errorMessage: undefined,
        }));
      }, 600);
    } catch (err: any) {
      console.warn('Screen share permission error:', err);
      setScreenMonitor((prev) => ({
        ...prev,
        isSharing: false,
        status: 'error',
        errorMessage: err?.message || 'Screen capture permission was cancelled or denied.',
      }));
    }
  }, [captureScreenFrame, handleStopScreenShare]);

  // Live Display Protocol Cards with Session Resumption
  const [liveCards, setLiveCards] = useState<LiveDisplayCard[]>(() => {
    try {
      const saved = localStorage.getItem('JARVIS_SESSION_CARDS_V2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not restore cards from localStorage:', e);
    }
    return [
      {
        id: 'card-sys-update',
        query: 'SYSTEM DIAGNOSTIC: Status on Gemini Backend & Speech Engines?',
        response: "All neural systems optimal! The backend Gemini API connection is upgraded to High Throughput Pro Capacity (65,536 max tokens) with Context Window Compression and Session Resumption.",
        timestamp: new Date().toLocaleTimeString(),
        category: 'SYSTEM',
        suggestedFollowUps: ['How are you feeling, JARVIS?', 'Show system telemetry', 'Give me a cool tech tip'],
      },
      {
        id: 'card-init-1',
        query: 'Hello JARVIS! What can you do?',
        response: "Hey there! I'm JARVIS, your casual and friendly AI companion. Ask me anything, analyze screen frames, or switch tabs—I restore our active session seamlessly every time!",
        timestamp: new Date().toLocaleTimeString(),
        category: 'GENERAL',
        suggestedFollowUps: ['What is the weather right now?', 'Write a Python script', 'Explain Quantum Computing'],
      },
    ];
  });

  // Save session state & cards to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('JARVIS_SESSION_STATE_V2', JSON.stringify(sessionState));
      localStorage.setItem('JARVIS_SESSION_CARDS_V2', JSON.stringify(liveCards));
    } catch (e) {
      console.warn('Failed to save session state to localStorage:', e);
    }
  }, [sessionState, liveCards]);

  // Start a fresh session
  const handleNewSession = useCallback(() => {
    const newSession: SessionState = {
      sessionId: `SES-${Date.now()}`,
      isResuming: false,
      tier: 'PRO_ENTERPRISE_HIGH_THROUGHPUT',
      maxOutputTokens: 65536,
      compressionEnabled: true,
      compressionRatio: '0% COMPRESSED',
      compressedContextSummary: '',
      sessionStartedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    setSessionState(newSession);
    setLiveCards([
      {
        id: `card-fresh-${Date.now()}`,
        query: 'JARVIS Session Reset',
        response: 'Fresh JARVIS Neural Session initialized! High Throughput Pro Tier active with 65,536 token output ceiling.',
        timestamp: new Date().toLocaleTimeString(),
        category: 'SYSTEM',
      },
    ]);
  }, []);


  // System telemetry metrics state
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuLoad: 48,
    memoryUsage: 62,
    tempCelsius: 22.4,
    firewallStatus: 'ACTIVE_OPTIMAL',
    satelliteSignal: '100%',
    uplinkLatencyMs: 14,
    gpuUsage: 34,
    activeThreads: 8,
  });

  // GPS Location state
  const [gpsLocation, setGpsLocation] = useState<GPSLocation>({
    lat: 40.7128,
    lng: -74.0060,
    accuracy: null,
    altitude: null,
    heading: null,
    speed: null,
    status: 'IDLE',
    addressName: 'Sector 04 (Default)',
    timestamp: null,
  });

  // Voice engine customization settings
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(1.0);

  // Voice Gender State with persistence
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>(() => {
    try {
      const saved = localStorage.getItem('JARVIS_VOICE_GENDER');
      if (saved === 'male' || saved === 'female') return saved;
    } catch (e) {}
    return 'male';
  });

  // Language Engine State with persistence ('en-US' | 'te-IN')
  const [language, setLanguage] = useState<'en-US' | 'te-IN'>(() => {
    try {
      const saved = localStorage.getItem('JARVIS_LANG');
      if (saved === 'te-IN' || saved === 'en-US') return saved;
    } catch (e) {}
    return 'en-US';
  });

  // Pre-load speech synthesis voices on initial mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // JARVIS Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    activePrompt: '',
    interimTranscript: '',
    lastResponse: 'Greetings. JARVIS Neural Core V2.1 online. Speech perception & satellite telemetry active.',
    voiceRate: 1.0,
    voicePitch: 1.0,
    voiceVolume: 1.0,
    voiceGender: voiceGender,
    language: language,
    synthesisStatusText: '> Standby_Listening_Engaged_',
    micPermissionState: 'prompt',
    speechEngineType: 'web_speech',
  });

  // Web Speech Recognition references & stability guards
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const restartTimerRef = useRef<any>(null);
  const lastPromptRef = useRef<string>('');
  const lastPromptTimeRef = useRef<number>(0);
  const gpsWatchIdRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<any>(null);

  // Audio Queue Refs for immediate real-time stream chunking
  const audioQueueRef = useRef<string[]>([]);
  const isSpeakingChunkRef = useRef<boolean>(false);

  // Gemini Live API WebSockets & PCM Audio Streaming Refs
  const liveWsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextAudioStartTimeRef = useRef<number>(0);
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Convert Float32 audio array to 16-bit Int16 Base64 string for 16kHz PCM streaming
  const float32ToInt16Base64 = useCallback((float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    let binary = '';
    const bytes = new Uint8Array(int16Array.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  // Barge-In / Native Interruption: Instantly stop all active audio playback
  const handleStopAllAudioPlayback = useCallback(() => {
    activeAudioSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {}
    });
    activeAudioSourcesRef.current = [];
    nextAudioStartTimeRef.current = 0;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    isSpeakingRef.current = false;
    setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  // Low-Latency Native 24kHz PCM Audio Output Player with gapless precision scheduling
  const playLivePcmAudioChunk = useCallback((base64Audio: string) => {
    try {
      const binaryStr = atob(base64Audio);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
      }
      const outputCtx = outputAudioCtxRef.current;
      if (outputCtx.state === 'suspended') {
        outputCtx.resume();
      }

      const buffer = outputCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = outputCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(outputCtx.destination);

      const now = outputCtx.currentTime;
      if (nextAudioStartTimeRef.current < now) {
        nextAudioStartTimeRef.current = now + 0.02; // 20ms gapless buffer
      }

      source.start(nextAudioStartTimeRef.current);
      nextAudioStartTimeRef.current += buffer.duration;

      activeAudioSourcesRef.current.push(source);
      source.onended = () => {
        activeAudioSourcesRef.current = activeAudioSourcesRef.current.filter((s) => s !== source);
        if (activeAudioSourcesRef.current.length === 0 && outputCtx.currentTime >= nextAudioStartTimeRef.current) {
          isSpeakingRef.current = false;
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
        }
      };

      isSpeakingRef.current = true;
      setVoiceState((prev) => ({ ...prev, isSpeaking: true }));
    } catch (err) {
      console.error('Error playing 24kHz PCM audio chunk:', err);
    }
  }, []);

  // Connect to Gemini Live API WebSocket Bridge (/api/live)
  const connectLiveWs = useCallback(() => {
    if (liveWsRef.current && (liveWsRef.current.readyState === WebSocket.OPEN || liveWsRef.current.readyState === WebSocket.CONNECTING)) {
      return liveWsRef.current;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[LIVE_WS] Gemini Live API WebSocket connection established');
      setVoiceState((prev) => ({ ...prev, synthesisStatusText: '> GEMINI_3.1_FLASH_LIVE_ONLINE' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // 1. Low-Latency Native Audio Output (24kHz PCM)
        if (msg.audio) {
          playLivePcmAudioChunk(msg.audio);
        }

        // 2. Native Interruption (Barge-In) Signal
        if (msg.interrupted) {
          console.log('[LIVE_WS] Interruption signal received from model (Barge-in)');
          handleStopAllAudioPlayback();
        }

        // 3. Model Output & User Input Transcriptions
        if (msg.text) {
          setVoiceState((prev) => ({
            ...prev,
            lastResponse: (prev.lastResponse || '') + msg.text,
            synthesisStatusText: '> Native_Audio_Streaming...',
          }));

          setLiveCards((prev) => {
            if (prev.length === 0) return prev;
            const first = prev[0];
            const updatedResp = (first.response === '...' ? '' : first.response) + msg.text;
            return [{ ...first, response: updatedResp }, ...prev.slice(1)];
          });
        }

        if (msg.turnComplete) {
          setVoiceState((prev) => ({ ...prev, synthesisStatusText: '> Live_Turn_Complete' }));
        }

        if (msg.error) {
          console.warn('[LIVE_WS] Error from Gemini Live API:', msg.error);
        }
      } catch (err) {
        console.error('[LIVE_WS] Error parsing websocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[LIVE_WS] Gemini Live WebSocket closed');
      liveWsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error('[LIVE_WS] Gemini Live WebSocket error:', err);
    };

    liveWsRef.current = ws;
    return ws;
  }, [playLivePcmAudioChunk, handleStopAllAudioPlayback]);

  // Browser Audio Unlock helper to unblock HTML5 Audio / Web Audio policy on user click
  const unlockBrowserAudio = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      }
    } catch (e) {
      console.warn('Audio context unlock warning:', e);
    }
  }, []);

  // Continuous 16kHz PCM Microphone Audio Streamer
  const startLiveAudioStream = useCallback(async () => {
    try {
      unlockBrowserAudio();
      const ws = connectLiveWs();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;

      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(2048, 1, 1);
      inputProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Barge-In Detection: check user voice volume RMS
        let sumSq = 0;
        for (let i = 0; i < inputData.length; i++) {
          sumSq += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sumSq / inputData.length);

        // If user speaks while assistant is outputting audio, trigger immediate barge-in interruption!
        if (rms > 0.04 && isSpeakingRef.current) {
          console.log('[BARGE_IN] User active voice detected -> interrupting playback');
          handleStopAllAudioPlayback();
        }

        // Convert Float32 array to 16kHz Int16 Base64 PCM chunk
        const base64Pcm = float32ToInt16Base64(inputData);

        // Stream continuous audio frame to Gemini Live WebSocket
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ audio: base64Pcm }));
        }
      };

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      isListeningRef.current = true;
      setVoiceState((prev) => ({
        ...prev,
        isListening: true,
        micPermissionState: 'granted',
        micErrorMessage: undefined,
        synthesisStatusText: '> Gemini_Live_16kHz_PCM_Mic_Streaming...',
      }));
    } catch (err: any) {
      console.error('Failed to start Live 16kHz PCM audio stream:', err);
      setVoiceState((prev) => ({
        ...prev,
        isListening: false,
        micPermissionState: 'denied',
        micErrorMessage: 'Failed to access microphone for Live 16kHz PCM stream.',
      }));
    }
  }, [connectLiveWs, unlockBrowserAudio, float32ToInt16Base64, handleStopAllAudioPlayback]);

  // Stop continuous microphone audio stream
  const stopLiveAudioStream = useCallback(() => {
    if (inputProcessorRef.current) {
      inputProcessorRef.current.disconnect();
      inputProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    isListeningRef.current = false;
    setVoiceState((prev) => ({
      ...prev,
      isListening: false,
      synthesisStatusText: '> Live_Mic_Offline_',
    }));
  }, []);

  // Safe launcher for speech recognition
  const safeStartRecognition = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return;
    if (isSpeakingRef.current) return; // Do not listen while JARVIS is speaking to prevent self-hearing echo!
    if (isStartingRef.current) return;

    try {
      isStartingRef.current = true;
      recognitionRef.current.start();
    } catch (err: any) {
      isStartingRef.current = false;
      // If already started or transitioning, queue a retry
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        if (isListeningRef.current && !isSpeakingRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e2) {}
        }
      }, 300);
    }
  }, []);

  // Automated Trigger Engine state (Hands-Free Listening Loop)
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState<boolean>(true);
  const autoTriggerRef = useRef<boolean>(true);

  useEffect(() => {
    autoTriggerRef.current = autoTriggerEnabled;
  }, [autoTriggerEnabled]);

  // Toggle Automated Trigger Engine on/off
  const handleToggleAutoTrigger = useCallback(() => {
    setAutoTriggerEnabled((prev) => {
      const next = !prev;
      autoTriggerRef.current = next;
      setVoiceState((vPrev) => ({
        ...vPrev,
        autoTriggerEnabled: next,
        synthesisStatusText: next ? '> Auto_Trigger_Engine_ACTIVE (Hands-Free)' : '> Auto_Trigger_Engine_Paused',
      }));

      if (next) {
        isListeningRef.current = true;
        safeStartRecognition();
      }
      return next;
    });
  }, [safeStartRecognition]);

  // Automated trigger listener: automatically arms mic on page load or initial user interaction
  useEffect(() => {
    const triggerAutoListening = () => {
      unlockBrowserAudio();
      if (autoTriggerRef.current && recognitionRef.current && !isListeningRef.current && !isSpeakingRef.current) {
        isListeningRef.current = true;
        safeStartRecognition();
      }
    };

    // Auto-trigger attempt on mount
    const timer = setTimeout(triggerAutoListening, 1000);

    window.addEventListener('click', triggerAutoListening, { passive: true });
    window.addEventListener('touchstart', triggerAutoListening, { passive: true });
    window.addEventListener('keydown', triggerAutoListening, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', triggerAutoListening);
      window.removeEventListener('touchstart', triggerAutoListening);
      window.removeEventListener('keydown', triggerAutoListening);
    };
  }, [safeStartRecognition, unlockBrowserAudio]);

  // Poll system telemetry periodically
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/system/telemetry');
        if (res.ok) {
          const data = await res.json();
          setMetrics((prev) => ({
            ...prev,
            cpuLoad: data.cpuLoad,
            memoryUsage: data.memoryUsage,
            tempCelsius: data.tempCelsius,
            uplinkLatencyMs: data.uplinkLatencyMs,
          }));
        }
      } catch (e) {
        // Fallback random fluctuation for smooth HUD display
        setMetrics((prev) => ({
          ...prev,
          cpuLoad: Math.min(95, Math.max(25, prev.cpuLoad + Math.floor((Math.random() - 0.5) * 6))),
          tempCelsius: Number((22.0 + Math.random() * 1.5).toFixed(1)),
        }));
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  // Request exact built-in device GPS hardware location
  const handleRequestGPS = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsLocation((prev) => ({
        ...prev,
        status: 'ERROR',
        errorMessage: 'Built-in GPS hardware sensor is not supported by your browser.',
      }));
      return;
    }

    setGpsLocation((prev) => ({ ...prev, status: 'REQUESTING' }));

    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
    }

    const onPosSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
      
      setGpsLocation({
        lat: latitude,
        lng: longitude,
        accuracy,
        altitude,
        heading,
        speed,
        status: 'LOCKED',
        source: 'BUILT_IN_DEVICE_GPS',
        addressName: `Device GPS: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° (±${Math.round(accuracy || 0)}m)`,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Reverse geocode via OpenStreetMap Nominatim to resolve exact street/city name from built-in device GPS coordinates
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            const shortAddr = parts.slice(0, 3).join(',').trim();
            setGpsLocation((prev) => ({
              ...prev,
              addressName: `${shortAddr} (Built-in GPS ±${Math.round(accuracy || 0)}m)`,
            }));
          }
        })
        .catch(() => {});
    };

    const onPosError = (error: GeolocationPositionError) => {
      let errMsg = 'Failed to acquire position from built-in device GPS sensor.';
      if (error.code === error.PERMISSION_DENIED) {
        errMsg = 'Device GPS permission denied by user or browser policy.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errMsg = 'Built-in device GPS position unavailable.';
      } else if (error.code === error.TIMEOUT) {
        errMsg = 'Device GPS hardware request timed out.';
      }

      setGpsLocation((prev) => ({
        ...prev,
        status: error.code === error.PERMISSION_DENIED ? 'DENIED' : 'ERROR',
        errorMessage: errMsg,
      }));
    };

    // Use highAccuracy options to force built-in device hardware GPS sensor
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(onPosSuccess, onPosError, options);
    gpsWatchIdRef.current = navigator.geolocation.watchPosition(onPosSuccess, onPosError, options);
  }, []);

  // Request built-in device GPS on initial app load
  useEffect(() => {
    handleRequestGPS();
    return () => {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
    };
  }, [handleRequestGPS]);

  // Helper to detect automatic voice gender switch commands in user voice or text input
  const detectVoiceGenderCommand = useCallback((text: string): 'female' | 'male' | null => {
    if (!text) return null;
    const lower = text.toLowerCase().trim();

    const femalePatterns = [
      /\b(change|switch|set|use|make|speak|turn on|convert|select)\b.*\b(female|woman|lady|girl)\b/,
      /\b(female|woman|lady)\s*(voice|gender|pitch|speaker|mode|tone)\b/,
      /\b(use|speak in|be a)\s*(female|woman|lady)\b/,
      /\b(female voice)\b/,
      /\b(voice female)\b/,
      /\bchange to female\b/,
      /\bswitch to female\b/,
      /\bmake it female\b/,
    ];

    const malePatterns = [
      /\b(change|switch|set|use|make|speak|turn on|convert|select)\b.*\b(male|man|guy|boy)\b/,
      /\b(male|man|guy)\s*(voice|gender|pitch|speaker|mode|tone)\b/,
      /\b(use|speak in|be a)\s*(male|man|guy)\b/,
      /\b(male voice)\b/,
      /\b(voice male)\b/,
      /\bchange to male\b/,
      /\bswitch to male\b/,
      /\bmake it male\b/,
    ];

    for (const pat of femalePatterns) {
      if (pat.test(lower)) return 'female';
    }
    for (const pat of malePatterns) {
      if (pat.test(lower)) return 'male';
    }

    return null;
  }, []);

  // Audio Fallback Stream for Telugu when no native te-IN OS voice is installed
  const playTeluguAudioStream = useCallback(
    (fullText: string) => {
      if (isMuted) return;

      // Clean markdown symbols from spoken text
      const cleanText = fullText.replace(/[*#_`]/g, '').trim();
      if (!cleanText) return;

      // Stop any prior speech synthesis or audio playback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }

      // Split into chunks for translate_tts endpoint (< 140 chars per chunk)
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
      const chunks: string[] = [];

      for (const sentence of sentences) {
        if (sentence.length <= 140) {
          chunks.push(sentence.trim());
        } else {
          const words = sentence.split(' ');
          let currentChunk = '';
          for (const word of words) {
            if ((currentChunk + ' ' + word).length > 140) {
              if (currentChunk.trim()) chunks.push(currentChunk.trim());
              currentChunk = word;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + word;
            }
          }
          if (currentChunk.trim()) chunks.push(currentChunk.trim());
        }
      }

      if (chunks.length === 0) return;

      let chunkIndex = 0;

      const playNextChunk = () => {
        if (chunkIndex >= chunks.length || isMuted) {
          isSpeakingRef.current = false;
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
          audioElementRef.current = null;
          if (isListeningRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = setTimeout(() => {
              safeStartRecognition();
            }, 300);
          }
          return;
        }

        const chunk = chunks[chunkIndex];
        chunkIndex++;

        const url = `/api/tts?text=${encodeURIComponent(chunk)}&lang=te`;
        const audio = new Audio(url);
        audio.volume = voiceVolume;
        audioElementRef.current = audio;

        audio.onplay = () => {
          isSpeakingRef.current = true;
          setVoiceState((prev) => ({ ...prev, isSpeaking: true }));
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (e) {}
          }
        };

        audio.onended = () => {
          playNextChunk();
        };

        audio.onerror = (e) => {
          console.error('Telugu audio fallback playback error:', e);
          playNextChunk();
        };

        audio.play().catch((err) => {
          console.error('Audio play blocked or error:', err);
          isSpeakingRef.current = false;
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
          audioElementRef.current = null;
        });
      };

      playNextChunk();
    },
    [isMuted, voiceVolume, safeStartRecognition]
  );

  // Clear all pending audio chunks and stop speech synthesis
  const clearAudioQueue = useCallback(() => {
    audioQueueRef.current = [];
    isSpeakingChunkRef.current = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    isSpeakingRef.current = false;
    setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  // Speak a single sentence or clause text chunk via Web Speech API
  const speakSingleChunk = useCallback(
    (chunkText: string, overrideGender?: 'male' | 'female', overrideLang?: 'en-US' | 'te-IN', onChunkEnd?: () => void) => {
      if (isMuted || !chunkText.trim()) {
        onChunkEnd?.();
        return;
      }

      const targetGender = overrideGender || voiceGender;
      const targetLang = overrideLang || language;

      if (!('speechSynthesis' in window)) {
        onChunkEnd?.();
        return;
      }

      // Stop listening during speech synthesis to prevent self-hearing echo
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const utterance = new SpeechSynthesisUtterance(chunkText.trim());
      utterance.lang = targetLang;

      let pitch = voicePitch;
      if (targetGender === 'female') {
        pitch = Math.max(1.2, voicePitch);
      } else {
        pitch = Math.min(0.85, voicePitch);
      }
      utterance.pitch = pitch;
      utterance.rate = voiceRate;
      utterance.volume = voiceVolume;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (targetLang === 'te-IN') {
        selectedVoice = voices.find(
          (v) => v.lang.toLowerCase().startsWith('te') || v.name.toLowerCase().includes('telugu')
        );
      }

      if (!selectedVoice) {
        if (targetGender === 'female') {
          const femaleKeywords = ['samantha', 'victoria', 'karen', 'zira', 'fiona', 'moira', 'veena', 'female', 'jenny', 'aria', 'ana'];
          selectedVoice = voices.find((v) => femaleKeywords.some((kw) => v.name.toLowerCase().includes(kw)));
        } else {
          const maleKeywords = ['daniel', 'david', 'alex', 'george', 'guy', 'male', 'mark', 'james'];
          selectedVoice = voices.find((v) => maleKeywords.some((kw) => v.name.toLowerCase().includes(kw)));
        }
      }

      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setVoiceState((prev) => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        onChunkEnd?.();
      };

      utterance.onerror = (err) => {
        console.warn('Chunk speech synthesis error:', err);
        onChunkEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [isMuted, voiceGender, language, voicePitch, voiceRate, voiceVolume]
  );

  // Process next audio chunk from queue sequentially for zero-latency audio streaming
  const processAudioQueue = useCallback(
    (overrideGender?: 'male' | 'female', overrideLang?: 'en-US' | 'te-IN') => {
      if (isSpeakingChunkRef.current) return;
      if (audioQueueRef.current.length === 0) return;

      const nextChunk = audioQueueRef.current.shift();
      if (!nextChunk) return;

      isSpeakingChunkRef.current = true;
      speakSingleChunk(nextChunk, overrideGender, overrideLang, () => {
        isSpeakingChunkRef.current = false;
        if (audioQueueRef.current.length > 0) {
          processAudioQueue(overrideGender, overrideLang);
        } else {
          isSpeakingRef.current = false;
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
          if (isListeningRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = setTimeout(() => {
              safeStartRecognition();
            }, 300);
          }
        }
      });
    },
    [speakSingleChunk, safeStartRecognition]
  );

  // Text-To-Speech Synthesis helper with acoustic echo prevention, dynamic voice gender & immediate chunking
  const speakJARVISResponse = useCallback(
    (text: string, overrideGender?: 'male' | 'female', overrideLang?: 'en-US' | 'te-IN') => {
      clearAudioQueue();

      const targetLang = overrideLang || language;
      if (targetLang === 'te-IN') {
        const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
        const teluguVoice = voices.find(
          (v) => v.lang.toLowerCase().startsWith('te') || v.name.toLowerCase().includes('telugu')
        );

        if (!teluguVoice) {
          playTeluguAudioStream(text);
          return;
        }
      }

      audioQueueRef.current.push(text);
      processAudioQueue(overrideGender, overrideLang);
    },
    [clearAudioQueue, language, playTeluguAudioStream, processAudioQueue]
  );

  // Manual Voice Gender Toggle handler
  const handleToggleVoiceGender = useCallback(() => {
    unlockBrowserAudio();
    const nextGender = voiceGender === 'male' ? 'female' : 'male';
    setVoiceGender(nextGender);
    localStorage.setItem('JARVIS_VOICE_GENDER', nextGender);
    const newPitch = nextGender === 'female' ? 1.25 : 0.85;
    setVoicePitch(newPitch);
    setVoiceState((prev) => ({
      ...prev,
      voiceGender: nextGender,
      voicePitch: newPitch,
      synthesisStatusText: `> Voice_Gender_Set_${nextGender.toUpperCase()}_`,
    }));
    speakJARVISResponse(`Voice synthesis gender switched to ${nextGender.toUpperCase()}.`, nextGender);
  }, [voiceGender, speakJARVISResponse, unlockBrowserAudio]);

  // Manual Language Toggle handler (English en-US <-> Telugu te-IN)
  const handleToggleLanguage = useCallback(() => {
    unlockBrowserAudio();
    const nextLang = language === 'en-US' ? 'te-IN' : 'en-US';
    setLanguage(nextLang);
    localStorage.setItem('JARVIS_LANG', nextLang);

    if (recognitionRef.current) {
      recognitionRef.current.lang = nextLang;
      if (isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }

    setVoiceState((prev) => ({
      ...prev,
      language: nextLang,
      synthesisStatusText: `> Language_Engine_Set_${nextLang === 'te-IN' ? 'TELUGU_TE' : 'ENGLISH_EN'}_`,
    }));

    const confirmMsg = nextLang === 'te-IN'
      ? "తెలుగు భాషా వ్యవస్థ సక్రియం చేయబడింది."
      : "English language engine activated.";

    speakJARVISResponse(confirmMsg, undefined, nextLang);
  }, [language, speakJARVISResponse, unlockBrowserAudio]);

  // Helper to categorize queries
  const detectCategory = (query: string): 'general' | 'code' | 'weather' | 'system' | 'creative' | 'math' => {
    const q = query.toLowerCase();
    if (q.includes('code') || q.includes('script') || q.includes('python') || q.includes('typescript') || q.includes('function')) return 'code';
    if (q.includes('weather') || q.includes('temp') || q.includes('climate') || q.includes('forecast') || q.includes('rain')) return 'weather';
    if (q.includes('math') || q.includes('tip') || q.includes('calculate') || q.includes('%') || q.includes('+') || q.includes('*')) return 'math';
    if (q.includes('cpu') || q.includes('memory') || q.includes('system') || q.includes('telemetry') || q.includes('status')) return 'system';
    if (q.includes('idea') || q.includes('story') || q.includes('creative') || q.includes('app')) return 'creative';
    return 'general';
  };

  // Send Prompt to Gemini AI Core
  const handleSendPrompt = useCallback(
    async (promptText: string, screenFrameBase64?: string): Promise<string> => {
      unlockBrowserAudio();
      const trimmed = promptText.trim();
      const now = Date.now();

      let frameToAttach = screenFrameBase64;
      if (!frameToAttach && screenStreamRef.current) {
        frameToAttach = captureScreenFrame() || screenMonitor.lastFrameSnapshotUrl || undefined;
      }

      if (frameToAttach) {
        setScreenMonitor((prev) => ({ ...prev, lastFrameSnapshotUrl: frameToAttach, status: 'analyzing' }));
      }

      // Deduplicate identical prompts within 2 seconds unless attaching new screen frame
      if (lastPromptRef.current === trimmed && now - lastPromptTimeRef.current < 2000 && !frameToAttach) {
        return '';
      }

      lastPromptRef.current = trimmed;
      lastPromptTimeRef.current = now;

      // Check if user prompt is ordering an automatic Voice Gender change command
      const requestedGender = detectVoiceGenderCommand(trimmed);
      let activeSpeechGender = voiceGender;

      if (requestedGender) {
        activeSpeechGender = requestedGender;
        setVoiceGender(requestedGender);
        localStorage.setItem('JARVIS_VOICE_GENDER', requestedGender);
        const newPitch = requestedGender === 'female' ? 1.25 : 0.85;
        setVoicePitch(newPitch);
        setVoiceState((prev) => ({
          ...prev,
          voiceGender: requestedGender,
          voicePitch: newPitch,
          synthesisStatusText: `> Voice_Gender_Switched_${requestedGender.toUpperCase()}_`,
        }));

        // If the command is purely a voice gender change request
        const isPureCommand = /^(change|switch|set|use|make|turn on|convert|select)?\s*(your\s*)?(voice\s*)?(to\s*)?(female|male|woman|man|girl|boy|lady|guy)\s*(voice|mode|gender)?$/i.test(trimmed);
        if (isPureCommand) {
          const confirmReply = `Voice synthesis gender successfully updated to ${requestedGender.toUpperCase()}! Acoustic engine re-configured for ${requestedGender === 'female' ? 'Female speech synthesis' : 'Male resonant speech synthesis'}. How can I assist you now?`;

          setVoiceState((prev) => ({
            ...prev,
            lastResponse: confirmReply,
            synthesisStatusText: `> Voice_Active_${requestedGender.toUpperCase()}_`,
          }));

          const newCard: LiveDisplayCard = {
            id: `card-${Date.now()}`,
            query: trimmed,
            response: confirmReply,
            timestamp: new Date().toLocaleTimeString(),
            category: 'system',
          };
          setLiveCards((prev) => [newCard, ...prev]);

          speakJARVISResponse(confirmReply, requestedGender);
          return confirmReply;
        }
      }

      setVoiceState((prev) => ({
        ...prev,
        activePrompt: trimmed || 'JARVIS Screen Analysis Query',
        interimTranscript: '',
        synthesisStatusText: frameToAttach ? '> Analyzing_Screen_Vision...' : '> Processing_AI_Core...',
      }));

      try {
        // SLIDING WINDOW CHAT HISTORY INTERCEPTOR (Rolling Memory Cap)
        // Intercepts history right before submission & slices to retain only the last 4 recent turns.
        // Drops older messages to eliminate token bloat and prevent quota exhaustion.
        const SLIDING_WINDOW_CAP = 4;
        const historyPayload = liveCards
          .slice(0, SLIDING_WINDOW_CAP)
          .reverse() // Maintain chronological order for model context
          .map((card) => ({
            query: card.query,
            response: card.response,
          }));

        // Create initial card entry immediately for real-time text streaming
        const cardId = `card-${Date.now()}`;
        const initialCard: LiveDisplayCard = {
          id: cardId,
          query: trimmed || 'JARVIS Screen Vision Analysis',
          response: '...',
          timestamp: new Date().toLocaleTimeString(),
          category: frameToAttach ? 'screen' : detectCategory(trimmed),
          imagePreviewUrl: frameToAttach,
        };
        setLiveCards((prev) => [initialCard, ...prev]);

        // Call Real-Time Text Streaming Endpoint (/api/ai/stream)
        const response = await fetch('/api/ai/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmed || 'JARVIS Screen Monitor: Analyze my active screen frame, describe what you see, and ask if I have any questions about it.',
            mode: 'jarvis',
            lang: language,
            screenFrameBase64: frameToAttach,
            history: historyPayload,
            previousCompressedContext: sessionState.compressedContextSummary,
            sessionId: sessionState.sessionId,
            isResumedSession: sessionState.isResuming,
          }),
        });

        // Intercept HTTP 429 Rate Limit directly from network status code
        if (response.status === 429) {
          const rateLimitMsg = language === 'te-IN'
            ? 'అభ్యర్థనల పరిమితి దాటింది (HTTP 429 - Too Many Requests). దయచేసి ఒక క్షణం వేచి ఉండి మళ్ళీ ప్రయత్నించండి.'
            : 'API Rate limit reached (HTTP 429 - Too Many Requests). Please pause for a moment before sending your next prompt.';

          setLiveCards((prev) =>
            prev.map((c) => (c.id === cardId ? { ...c, response: rateLimitMsg, category: 'system' } : c))
          );
          setVoiceState((prev) => ({
            ...prev,
            isSpeaking: false,
            lastResponse: rateLimitMsg,
            synthesisStatusText: '> RATE_LIMIT_EXCEEDED (429) - PLEASE PAUSE',
          }));
          speakJARVISResponse(rateLimitMsg);
          return rateLimitMsg;
        }

        if (!response.body) {
          throw new Error('No stream body returned from server');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let unspokenBuffer = '';
        let buffer = '';

        clearAudioQueue();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.replace(/^data:\s*/, '').trim();
            if (!cleanLine) continue;

            try {
              const parsed = JSON.parse(cleanLine);

              if (parsed.is429 || parsed.status === 'rate_limit_exceeded') {
                const rateLimitMsg = language === 'te-IN'
                  ? 'అభ్యర్థనల పరిమితి దాటింది (HTTP 429 - Rate Limit Exceeded). దయచేసి ఒక క్షణం ఆగి ప్రశాంతంగా మళ్ళీ ప్రయత్నించండి.'
                  : 'API Rate limit reached (HTTP 429). Please pause for a moment before sending your next prompt.';
                accumulatedText = rateLimitMsg;
                setLiveCards((prev) =>
                  prev.map((c) => (c.id === cardId ? { ...c, response: rateLimitMsg, category: 'system' } : c))
                );
                speakJARVISResponse(rateLimitMsg);
                return rateLimitMsg;
              }

              if (parsed.chunk) {
                accumulatedText += parsed.chunk;
                unspokenBuffer += parsed.chunk;

                // Live stream text directly into UI card token-by-token
                setLiveCards((prev) =>
                  prev.map((c) => (c.id === cardId ? { ...c, response: accumulatedText } : c))
                );

                setVoiceState((prev) => ({
                  ...prev,
                  lastResponse: accumulatedText,
                  synthesisStatusText: '> Realtime_Streaming_Chunks...',
                }));

                // ZERO-LAG CHUNKED AUDIO SYNTHESIS
                // Immediately extract sentence chunks (. ! ? \n) as tokens stream in
                let match = unspokenBuffer.match(/^([\s\S]*?[.!?\n]+)([\s\S]*)$/);
                while (match) {
                  const sentence = match[1].trim();
                  unspokenBuffer = match[2];
                  if (sentence.length > 0) {
                    audioQueueRef.current.push(sentence);
                    processAudioQueue(activeSpeechGender, language);
                  }
                  match = unspokenBuffer.match(/^([\s\S]*?[.!?\n]+)([\s\S]*)$/);
                }

                // If unspoken buffer grows beyond 40 chars without sentence end, slice on clause boundary or space
                if (unspokenBuffer.length > 40) {
                  const spaceIdx = unspokenBuffer.lastIndexOf(' ');
                  if (spaceIdx > 15) {
                    const clauseChunk = unspokenBuffer.slice(0, spaceIdx).trim();
                    unspokenBuffer = unspokenBuffer.slice(spaceIdx + 1);
                    if (clauseChunk.length > 0) {
                      audioQueueRef.current.push(clauseChunk);
                      processAudioQueue(activeSpeechGender, language);
                    }
                  }
                }
              }

              if (parsed.done) {
                if (parsed.contextCompression) {
                  setSessionState((prev) => ({
                    ...prev,
                    compressionRatio: parsed.contextCompression.ratio || prev.compressionRatio,
                    compressedContextSummary: parsed.contextCompression.compressedSummary || prev.compressedContextSummary,
                    slidingWindowSize: parsed.contextCompression.slidingWindowTurns ?? SLIDING_WINDOW_CAP,
                    lastActiveAt: new Date().toISOString(),
                  }));
                }
              }
            } catch (e) {
              // Ignore partial JSON line parse errors
            }
          }
        }

        if (screenStreamRef.current) {
          setScreenMonitor((prev) => ({ ...prev, status: 'capturing' }));
        }

        // On stream completion: push any remaining unspoken buffer text to the audio queue
        if (unspokenBuffer.trim().length > 0) {
          audioQueueRef.current.push(unspokenBuffer.trim());
          unspokenBuffer = '';
          processAudioQueue(activeSpeechGender, language);
        }

        setVoiceState((prev) => ({
          ...prev,
          lastResponse: accumulatedText,
          synthesisStatusText: '> Realtime_Stream_Complete_',
        }));

        return accumulatedText;
      } catch (error: any) {
        console.warn('API / Network Communication Intercepted:', error);

        const isRateLimit =
          error?.status === 429 ||
          error?.statusCode === 429 ||
          error?.message?.includes('429') ||
          error?.message?.includes('rate') ||
          error?.message?.includes('quota') ||
          error?.message?.includes('Too Many Requests');

        const rateLimitOrFallbackMsg = isRateLimit
          ? (language === 'te-IN'
              ? 'అభ్యర్థనల పరిమితి దాటింది (HTTP 429 - Too Many Requests). దయచేసి ఒక క్షణం వేచి ఉండండి.'
              : 'API Rate limit reached (HTTP 429 - Too Many Requests). Please pause for a moment before trying again.')
          : (language === 'te-IN'
              ? `మీ ప్రశ్న "${trimmed}" నమోదైంది. స్థానిక సిస్టమ్‌లు సిద్ధంగా ఉన్నాయి!`
              : `System notice: Prompt received for "${trimmed}". Neural OS core is online.`);

        setVoiceState((prev) => ({
          ...prev,
          isSpeaking: false,
          lastResponse: rateLimitOrFallbackMsg,
          synthesisStatusText: isRateLimit ? '> RATE_LIMIT_EXCEEDED (429)' : '> Standby_',
        }));

        const newCard: LiveDisplayCard = {
          id: `card-${Date.now()}`,
          query: trimmed || 'Screen Vision Request',
          response: rateLimitOrFallbackMsg,
          timestamp: new Date().toLocaleTimeString(),
          category: isRateLimit ? 'system' : (frameToAttach ? 'screen' : detectCategory(trimmed)),
          imagePreviewUrl: frameToAttach,
          suggestedFollowUps: isRateLimit
            ? ['Pause for a moment', 'Retry prompt in 5 seconds', 'Check system status']
            : undefined,
        };
        setLiveCards((prev) => [newCard, ...prev]);

        speakJARVISResponse(rateLimitOrFallbackMsg);
        return rateLimitOrFallbackMsg;
      }
    },
    [captureScreenFrame, screenMonitor.lastFrameSnapshotUrl, speakJARVISResponse]
  );

  // Quick Action Handler for analyzing screen frame
  const handleAnalyzeScreen = useCallback(
    (customPrompt?: string) => {
      const frame = captureScreenFrame() || screenMonitor.lastFrameSnapshotUrl || undefined;
      handleSendPrompt(
        customPrompt || 'JARVIS, inspect my current screen frame and tell me what you see or ask if I have any questions about it.',
        frame
      );
    },
    [captureScreenFrame, screenMonitor.lastFrameSnapshotUrl, handleSendPrompt]
  );

  // Initialize Speech Recognition with upscaled stability architecture
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        isStartingRef.current = false;
        isListeningRef.current = true;
        setVoiceState((prev) => ({
          ...prev,
          isListening: true,
          micPermissionState: 'granted',
          micErrorMessage: undefined,
          synthesisStatusText: '> Voice_Perception_Active_Listening...',
        }));
      };

      recognition.onresult = (event: any) => {
        let interimStr = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcriptPart;
          } else {
            interimStr += transcriptPart;
          }
        }

        if (interimStr) {
          setVoiceState((prev) => ({
            ...prev,
            interimTranscript: interimStr,
            synthesisStatusText: `> Hearing: "${interimStr}"...`,
          }));
        }

        if (finalStr.trim()) {
          setVoiceState((prev) => ({
            ...prev,
            interimTranscript: '',
            activePrompt: finalStr.trim(),
          }));
          handleSendPrompt(finalStr.trim());
        }
      };

      recognition.onerror = (event: any) => {
        isStartingRef.current = false;
        const errType = event.error;

        if (errType === 'no-speech' || errType === 'aborted') {
          // Normal idle pause, keep status smooth
          return;
        }

        if (errType === 'not-allowed' || errType === 'permission-denied') {
          isListeningRef.current = false;
          setVoiceState((prev) => ({
            ...prev,
            isListening: false,
            micPermissionState: 'denied',
            micErrorMessage: 'Microphone permission was denied by browser settings.',
            synthesisStatusText: '> Mic_Permission_Denied_',
          }));
          return;
        }

        if (errType === 'network') {
          // Soft retry on network hiccup
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            safeStartRecognition();
          }, 1000);
          return;
        }

        console.warn('Speech recognition warning:', errType);
      };

      recognition.onend = () => {
        isStartingRef.current = false;
        // Auto-restart cleanly if user intends to stay listening & JARVIS isn't currently speaking
        if (isListeningRef.current && !isSpeakingRef.current) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            safeStartRecognition();
          }, 250);
        } else if (!isListeningRef.current) {
          setVoiceState((prev) => ({ ...prev, isListening: false }));
        }
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceState((prev) => ({ ...prev, micPermissionState: 'unsupported' }));
    }
  }, [handleSendPrompt, safeStartRecognition]);

  // Request Microphone Stream with Echo Cancellation & Toggle Gemini Live API Listening Mode
  const handleToggleListening = useCallback(async () => {
    unlockBrowserAudio();

    if (isListeningRef.current) {
      stopLiveAudioStream();
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {}
    } else {
      await startLiveAudioStream();
    }
  }, [unlockBrowserAudio, startLiveAudioStream, stopLiveAudioStream]);

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        handleStopAllAudioPlayback();
      }
      return next;
    });
  };

  return (
    <div className={`relative min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans overflow-x-hidden transition-colors duration-500 ${
      voiceGender === 'female' ? 'theme-female selection:bg-fuchsia-500/30' : 'theme-male selection:bg-[#00dbe7]/30'
    }`}>
      {/* Background Cybernetic HUD Grid */}
      <div className="fixed inset-0 z-0 hud-grid opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 z-0 scanline-effect pointer-events-none"></div>

      {/* Top App Header */}
      <HeaderBar
        activeTab={activeTab}
        metrics={metrics}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        sessionState={sessionState}
        onNewSession={handleNewSession}
        voiceGender={voiceGender}
        onToggleVoiceGender={handleToggleVoiceGender}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main View Router */}
      <main className="relative z-10 w-full min-h-screen pb-16">
        {activeTab === 'core' && (
          <VoiceCoreView
            metrics={metrics}
            voiceState={voiceState}
            gpsLocation={gpsLocation}
            screenMonitor={screenMonitor}
            onRequestGPS={handleRequestGPS}
            onSendPrompt={handleSendPrompt}
            onToggleListening={handleToggleListening}
            onOpenLiveDisplay={() => setActiveTab('live_display')}
            onStartScreenShare={handleStartScreenShare}
            onAnalyzeScreen={handleAnalyzeScreen}
            isMuted={isMuted}
            onToggleVoiceGender={handleToggleVoiceGender}
            autoTriggerEnabled={autoTriggerEnabled}
            onToggleAutoTrigger={handleToggleAutoTrigger}
          />
        )}

        {activeTab === 'live_display' && (
          <LiveDisplayProtocolView
            metrics={metrics}
            gpsLocation={gpsLocation}
            voiceState={voiceState}
            screenMonitor={screenMonitor}
            sessionState={sessionState}
            liveCards={liveCards}
            onSendPrompt={handleSendPrompt}
            onStartScreenShare={handleStartScreenShare}
            onStopScreenShare={handleStopScreenShare}
            onAnalyzeScreen={handleAnalyzeScreen}
            onToggleListening={handleToggleListening}
            onSpeakText={speakJARVISResponse}
            onClearCards={() => setLiveCards([])}
            onNewSession={handleNewSession}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalView metrics={metrics} onSendAiQuery={handleSendPrompt} />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsView
            metrics={metrics}
            voiceRate={voiceRate}
            setVoiceRate={setVoiceRate}
            voicePitch={voicePitch}
            setVoicePitch={setVoicePitch}
            voiceVolume={voiceVolume}
            setVoiceVolume={setVoiceVolume}
            sessionState={sessionState}
            voiceGender={voiceGender}
            setVoiceGender={(g) => {
              setVoiceGender(g);
              localStorage.setItem('JARVIS_VOICE_GENDER', g);
              const newPitch = g === 'female' ? 1.25 : 0.85;
              setVoicePitch(newPitch);
              setVoiceState((prev) => ({
                ...prev,
                voiceGender: g,
                voicePitch: newPitch,
                synthesisStatusText: `> Voice_Gender_Set_${g.toUpperCase()}_`,
              }));
              speakJARVISResponse(`Voice synthesis gender switched to ${g.toUpperCase()}.`, g);
            }}
            language={language}
            setLanguage={(l) => {
              setLanguage(l);
              localStorage.setItem('JARVIS_LANG', l);
              if (recognitionRef.current) {
                recognitionRef.current.lang = l;
              }
              setVoiceState((prev) => ({
                ...prev,
                language: l,
                synthesisStatusText: `> Language_Engine_Set_${l === 'te-IN' ? 'TELUGU_TE' : 'ENGLISH_EN'}_`,
              }));
              speakJARVISResponse(l === 'te-IN' ? "తెలుగు భాషా వ్యవస్థ సక్రియం చేయబడింది." : "English language engine activated.", undefined, l);
            }}
          />
        )}

        {activeTab === 'tree' && <NeuralTreeView />}
      </main>


      {/* Bottom Floating Sci-Fi Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
