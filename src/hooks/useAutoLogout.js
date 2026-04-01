import { useEffect, useRef, useCallback } from 'react';

const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 jam dalam ms
const WARNING_BEFORE = 5 * 60 * 1000;    // warning 5 menit sebelum logout

export default function useAutoLogout(onLogout) {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const warningShownRef = useRef(false);

  const resetTimer = useCallback(() => {
    // Clear timer lama
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    warningShownRef.current = false;

    // Warning 5 menit sebelum logout
    warningRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        const stay = window.confirm('⚠️ Sesi kamu akan berakhir dalam 5 menit karena tidak aktif.\n\nKlik OK untuk tetap login.');
        if (stay) resetTimer();
      }
    }, TIMEOUT_DURATION - WARNING_BEFORE);

    // Auto logout setelah 1 jam
    timeoutRef.current = setTimeout(() => {
      localStorage.removeItem('nawala_token');
      onLogout();
    }, TIMEOUT_DURATION);
  }, [onLogout]);

  useEffect(() => {
    // Event yang dianggap "aktif"
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => resetTimer();

    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    resetTimer(); // mulai timer saat pertama load

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);
}
