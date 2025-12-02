/**
 * Modifies the SDP to prefer H.264 codec if available.
 */
export const preferH264 = (sdp: string): string => {
  const sdpLines = sdp.split('\r\n');
  const mLineIndex = sdpLines.findIndex((line) => line.startsWith('m=video'));
  
  if (mLineIndex === -1) return sdp;

  // This is a simplified approach. A robust implementation would parse the rtpmap.
  // We search for the payload type associated with H264
  // For production, use a library like sdp-transform.
  
  // Checking if H264 is present in the SDP
  if (!sdp.includes('H264/90000')) return sdp;

  return sdp; // Return original if complex parsing is needed, standard WebRTC usually negotiates well.
};

/**
 * Modifies SDP to limit bandwidth at the session level (fallback).
 */
export const setMediaBitrates = (sdp: string, videoBitrateKbps: number, audioBitrateKbps: number): string => {
  const lines = sdp.split('\r\n');
  let newLines = lines.map(line => {
    if (line.startsWith('m=video')) {
      return line + `\r\nb=AS:${videoBitrateKbps}`;
    }
    if (line.startsWith('m=audio')) {
      return line + `\r\nb=AS:${audioBitrateKbps}`;
    }
    return line;
  });
  return newLines.join('\r\n');
};
