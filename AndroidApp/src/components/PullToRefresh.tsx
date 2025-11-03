import { useEffect, useRef, useState } from 'react';

type Props = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
};

export function PullToRefresh({ onRefresh, children }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  const TRIGGER_DISTANCE = 80; // Distance in pixels to trigger refresh
  const MAX_DISTANCE = 120; // Maximum pull distance

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let hasTriggered = false;

    const isAtTop = () => {
      return window.scrollY === 0 || (document.documentElement.scrollTop === 0 && document.body.scrollTop === 0);
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh when at the top of the scroll
      if (isAtTop()) {
        isDragging = true;
        hasTriggered = false;
        startYRef.current = e.touches[0].clientY;
        currentYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      currentYRef.current = e.touches[0].clientY;
      const deltaY = currentYRef.current - startYRef.current;

      if (deltaY > 0 && isAtTop()) {
        e.preventDefault(); // Prevent page scroll while pulling
        const distance = Math.min(deltaY, MAX_DISTANCE);
        setPullDistance(distance);
        setIsPulling(distance > 10);

        if (distance >= TRIGGER_DISTANCE && !hasTriggered) {
          hasTriggered = true;
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging) return;

      const distance = currentYRef.current - startYRef.current;
      
      if (distance >= TRIGGER_DISTANCE && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }
      } else {
        // Animate back if not enough distance
        setPullDistance(0);
        setIsPulling(false);
      }

      isDragging = false;
      hasTriggered = false;
    };

    // Also handle mouse events for desktop testing
    const handleMouseDown = (e: MouseEvent) => {
      if (isAtTop() && e.button === 0) {
        isDragging = true;
        hasTriggered = false;
        startYRef.current = e.clientY;
        currentYRef.current = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      currentYRef.current = e.clientY;
      const deltaY = currentYRef.current - startYRef.current;

      if (deltaY > 0 && isAtTop()) {
        e.preventDefault();
        const distance = Math.min(deltaY, MAX_DISTANCE);
        setPullDistance(distance);
        setIsPulling(distance > 10);

        if (distance >= TRIGGER_DISTANCE && !hasTriggered) {
          hasTriggered = true;
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleMouseUp = async () => {
      if (!isDragging) return;
      const distance = currentYRef.current - startYRef.current;
      
      if (distance >= TRIGGER_DISTANCE && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }

      isDragging = false;
      hasTriggered = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Mouse events for desktop
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onRefresh, isRefreshing]);

  const progress = Math.min(pullDistance / TRIGGER_DISTANCE, 1);
  const shouldShowIndicator = isPulling || isRefreshing;
  const showFrostedGlass = (isPulling || isRefreshing) && progress >= 1;

  return (
    <div ref={containerRef} className="pull-to-refresh-container">
      {showFrostedGlass && (
        <div className="pull-to-refresh-backdrop" />
      )}
      <div 
        className={`pull-to-refresh-indicator ${shouldShowIndicator ? 'visible' : ''}`}
        style={{
          transform: `translateY(${Math.min(pullDistance, MAX_DISTANCE) - 60}px)`,
          opacity: shouldShowIndicator ? 1 : 0,
        }}
      >
        <div className="pull-to-refresh-spinner">
          {isRefreshing ? (
            <span className="refresh-spinner">⟳</span>
          ) : progress >= 1 ? (
            <span className="refresh-ready">↓</span>
          ) : (
            <span className="refresh-pull">↓</span>
          )}
        </div>
        <div className="pull-to-refresh-text">
          {isRefreshing ? 'Refreshing...' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      </div>
      {children}
    </div>
  );
}

