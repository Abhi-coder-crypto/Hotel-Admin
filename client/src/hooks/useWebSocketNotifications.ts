import { useEffect, useRef } from 'react';
import { soundNotifications, enableSoundNotifications } from '@/lib/soundNotifications';

interface UseWebSocketNotificationsProps {
  hotelId?: string;
  onNewServiceRequest?: (data: any) => void;
  enableSound?: boolean;
}

export function useWebSocketNotifications({ 
  hotelId, 
  onNewServiceRequest, 
  enableSound = true 
}: UseWebSocketNotificationsProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const connect = () => {
    if (!hotelId) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        // Join hotel channel
        wsRef.current?.send(JSON.stringify({
          type: 'join_hotel',
          hotelId: hotelId
        }));

        // Enable sound notifications on first connection
        if (!isInitializedRef.current && enableSound) {
          enableSoundNotifications();
          isInitializedRef.current = true;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different types of notifications
          if (data.type === 'new_service_request') {
            // Play sound notification for new service requests
            if (enableSound) {
              soundNotifications.playNewRequestNotification();
            }
            
            // Call callback if provided
            if (onNewServiceRequest) {
              onNewServiceRequest(data);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  useEffect(() => {
    if (hotelId) {
      connect();
    }

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [hotelId]);

  // Enable sound on user interaction (required for autoplay policies)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (enableSound) {
        enableSoundNotifications();
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [enableSound]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect: () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    }
  };
}