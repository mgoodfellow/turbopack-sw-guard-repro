'use client';

import { useEffect, useState } from 'react';

export default function Probe() {
  const [result, setResult] = useState('pending');

  useEffect(() => {
    try {
      if (!navigator.serviceWorker) {
        setResult('guard ran: no service worker support');
        return;
      }
      navigator.serviceWorker.addEventListener('message', () => {});
      setResult('service worker supported');
    } catch (error) {
      setResult(`guard was removed: ${error.message}`);
    }
  }, []);

  return <p id="result">{result}</p>;
}
