import { useEffect, useState } from "react";
import { z } from "zod";

const WEBSOCKET_URL = "ws://localhost:3000";

export const useWebSocket = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET_URL);
    setSocket(socket);

    socket.addEventListener("message", (event) => {
      const message = z.string().parse(event.data);
      setMessages((prevMessages: string[]) => [...prevMessages, message]);
    });

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
