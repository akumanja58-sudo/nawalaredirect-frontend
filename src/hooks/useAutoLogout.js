import { useEffect, useRef, useCallback, useState } from 'react';

const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 jam
const WARNING_BEFORE = 5 * 60 * 1000;    // warning 5 menit sebelum

export function useAutoLogout(onLogout) {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const [warning, setWarning] = useState(false);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    setWarning(false);

    warningRef.current = setTimeout(() => {
      setWarning(true);
    }, TIMEOUT_DURATION - WARNING_BEFORE);

    timeoutRef.current = setTimeout(() => {
      localStorage.removeItem('nawala_token');
      localStorage.setItem('nawala_logout_reason', 'session_expired');
      onLogout();
    }, TIMEOUT_DURATION);
  }, [onLogout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handle = () => resetTimer();
    events.forEach(e => window.addEventListener(e, handle, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handle));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
    };
  }, [resetTimer]);

  return { warning, resetTimer };
}
