export function debounce(func: (...args: any[]) => void, wait: number) {
  let timeoutId: number | undefined;

  return function debouncedFunction(...args: any[]) {
    if (!timeoutId) {
      func(...args);
    }
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
    }, wait);
  };
}
