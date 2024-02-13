import {useCallback, useRef} from "react";

export const useDebounce = <T extends () => void>(callback: T, delay: number): T => {
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const debouncedFunction = useCallback(() => {
        if(timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            callback();
        }, delay);
    }, [callback, delay]);

    return debouncedFunction as T;
}