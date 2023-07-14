import { useEffect, useState } from "react";

export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(function () {
    const storageValue = localStorage.getItem(key);
    if (!storageValue) return initialValue;
    return JSON.parse(storageValue);
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
