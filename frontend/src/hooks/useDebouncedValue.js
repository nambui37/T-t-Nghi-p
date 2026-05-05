import { useState, useEffect } from "react";

/**
 * Trả về giá trị sau khi người dùng ngừng gõ `delay` ms (lọc/tìm kiếm tự động).
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
