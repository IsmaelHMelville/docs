import { useEffect } from 'react';

export const useSWRegister = () => {
  useEffect(() => {
    if (
      !('serviceWorker' in navigator) ||
      process.env.NEXT_PUBLIC_SW_DEACTIVATED === 'true'
    ) {
      return;
    }

    const hadControllerAtStart = !!navigator.serviceWorker.controller;

    navigator.serviceWorker
      .register(`/service-worker.js`)
      .then((registration) => {
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (!newWorker) {
            return;
          }

          newWorker.onstatechange = () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          };
        };
      })
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });

    let refreshing = false;
    const onControllerChange = () => {
      if (!hadControllerAtStart || refreshing) {
        return;
      }

      refreshing = true;

      if (document.visibilityState === 'visible') {
        window.location.reload();
        return;
      }

      const onVisible = () => {
        if (document.visibilityState === 'visible') {
          window.location.reload();
        }
      };

      document.addEventListener('visibilitychange', onVisible, { once: true });
    };

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange,
      );
    };
  }, []);
};
