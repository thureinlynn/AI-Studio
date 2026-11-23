import React, { useEffect, useState, useRef } from 'react';

export const FlyingPlaneAnimation: React.FC = () => {
  const [flight, setFlight] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    id: string;
  } | null>(null);
  const [isFlying, setIsFlying] = useState(false);
  const nextFlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const triggerFlight = () => {
      if (!isMounted) return;

      const cardEls = document.querySelectorAll<HTMLElement>('[data-trip-card-id]');
      if (cardEls.length < 2) {
        nextFlightTimeoutRef.current = window.setTimeout(triggerFlight, 3000);
        return;
      }

      const indices = Array.from({ length: cardEls.length }, (_, i) => i);
      const srcIdx = Math.floor(Math.random() * indices.length);
      indices.splice(srcIdx, 1);
      const tgtIdx = indices[Math.floor(Math.random() * indices.length)];

      const srcCard = cardEls[srcIdx];
      const tgtCard = cardEls[tgtIdx];

      if (!srcCard || !tgtCard) {
        nextFlightTimeoutRef.current = window.setTimeout(triggerFlight, 3000);
        return;
      }

      const srcRect = srcCard.getBoundingClientRect();
      const tgtRect = tgtCard.getBoundingClientRect();

      // Take off from top border of source card
      const startX = srcRect.left + srcRect.width / 2 + window.scrollX;
      const startY = srcRect.top + window.scrollY;

      // Land to top border of target card
      const endX = tgtRect.left + tgtRect.width / 2 + window.scrollX;
      const endY = tgtRect.top + window.scrollY;

      setFlight({
        startX,
        startY,
        endX,
        endY,
        id: Math.random().toString(36).substring(2, 7),
      });
      setIsFlying(false);

      requestAnimationFrame(() => {
        if (isMounted) {
          setIsFlying(true);
        }
      });

      // Schedule next flight every 5 to 8 seconds
      const nextDelay = 5000 + Math.random() * 3000;
      nextFlightTimeoutRef.current = window.setTimeout(triggerFlight, nextDelay);
    };

    const initialTimer = window.setTimeout(triggerFlight, 2000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      if (nextFlightTimeoutRef.current) clearTimeout(nextFlightTimeoutRef.current);
    };
  }, []);

  if (!flight) return null;

  const currentX = isFlying ? flight.endX : flight.startX;
  const currentY = isFlying ? flight.endY : flight.startY;
  
  // Parabolic arc offset for takeoff and landing altitude (no dotted line)
  const progress = isFlying ? 1 : 0;
  const arcOffset = Math.sin(progress * Math.PI) * -110;
  const renderY = currentY + arcOffset;

  const isMovingRight = flight.endX >= flight.startX;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <div
        className="absolute transition-all duration-[2200ms] ease-in-out -translate-x-1/2 -translate-y-1/2 flex items-center justify-center filter drop-shadow-md"
        style={{
          left: `${currentX}px`,
          top: `${renderY}px`,
          opacity: 1,
        }}
      >
        {/* Side view black vector plane */}
        <svg
          className={`w-9 h-9 text-slate-900 dark:text-white fill-current transform transition-transform duration-700 ${
            isMovingRight ? 'rotate-[-12deg]' : 'scale-x-[-1] rotate-[-12deg]'
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>
    </div>
  );
};
