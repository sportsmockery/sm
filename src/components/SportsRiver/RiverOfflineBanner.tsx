'use client';

import { useWebSocket } from '@/context/WebSocketProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function RiverOfflineBanner() {
  const { connectionState } = useWebSocket();

  const show = connectionState === 'reconnecting' || connectionState === 'offline';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            height: 40,
            background: '#1B2430',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 13,
            color: '#94a3b8',
            zIndex: 49,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#00D4FF',
              display: 'inline-block',
              animation: 'riverPulse 1.5s ease-in-out infinite',
            }}
          />
          Reconnecting to live updates...
          <style>{`
            @keyframes riverPulse {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
