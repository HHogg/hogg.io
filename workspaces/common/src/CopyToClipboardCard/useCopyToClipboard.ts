import { useEffect, useState } from 'react';

export default function useCopyToClipboard() {
  const canCopy =
    typeof window === 'undefined' ? false : !!window.navigator?.clipboard;
  const [hasCopied, setHasCopied] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const copy = async (text: string) => {
    if (!canCopy) {
      console.warn('Clipboard not supported');
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setHasFailed(false);
    } catch (error) {
      setHasCopied(false);
      setHasFailed(true);
    }
  };

  useEffect(() => {
    if (hasCopied) {
      const timeout = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasCopied]);

  useEffect(() => {
    if (hasFailed) {
      const timeout = setTimeout(() => setHasFailed(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasFailed]);

  return {
    copy,
    canCopy,
    hasCopied,
    hasFailed,
  };
}
