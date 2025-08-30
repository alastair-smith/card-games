import { useEffect, useState } from 'react';
import { z } from 'zod';

// TODO swap to wss protocol
const WEBSOCKET_URL = 'ws://localhost:3001/socket';

export const useWebSocket = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // TODO send token from here
    const socket = new WebSocket(`${WEBSOCKET_URL}?token=123`);
    setSocket(socket);

    socket.addEventListener('message', (event) => {
      const message = z.string().parse(event.data);
      setMessages((prevMessages: string[]) => [...prevMessages, message]);
    });

    // cleanup
    return () => {
      socket.close();
    };
  }, [setMessages, setSocket]);

  const sendMessage = (message: string) => {
    if (socket) {
      socket.send(message);
    }
  };

  return { messages, sendMessage };
};
