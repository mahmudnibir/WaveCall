export const VIDEO_CONSTRAINTS = {
  width: { ideal: 320, max: 480 }, // Low resolution 240p target
  height: { ideal: 240, max: 360 },
  frameRate: { ideal: 15, max: 15 }, // Cap at 15fps
};

export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const ICE_SERVERS: RTCIceServer[] = [
  // Google's public STUN servers (Free & Reliable)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // In a real production app, add your TURN servers here
];

export const WS_URL = 'ws://localhost:8080'; // Local signaling server

// Bitrate thresholds in bits per second
export const BITRATE_CONFIG = {
  MIN_VIDEO_BITRATE: 80000,   // 80 kbps
  MAX_VIDEO_BITRATE: 120000,  // 120 kbps
  AUDIO_BITRATE: 12000,       // 12 kbps Opus
};
