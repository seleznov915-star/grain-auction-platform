let ws = null;

export const initSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("⚡ WebSocket already connected");
    return ws;
  }

 const WS_URL = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8000/ws';
ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('✅ WebSocket connected');
    ws.send('Hello from client!');
  };

  ws.onmessage = (event) => {
    console.log('📨 Message from server:', event.data);
  };

  ws.onclose = () => console.log('❌ WebSocket disconnected');
  ws.onerror = (err) => console.error('WebSocket error:', err);

  return ws;
};

export default ws;