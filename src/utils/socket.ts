import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(window.location.origin, {
      autoConnect: true,
      withCredentials: true,
    });
  }
  return socket!;
};
