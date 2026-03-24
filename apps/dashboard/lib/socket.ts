import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('accessToken');
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};