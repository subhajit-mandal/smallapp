import {useCallback, useEffect, useState} from "react";
import {useDebounce} from "./useDebounce";

const defaultFetchOptions: { [s: string]: object } = {
    headers: { "Content-Type": "application/json" },
};

export const useApiFetch = <T>(url: string, options?: { [s: string]: object }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [data, setData] = useState<T>();

    const fetchFunction = useCallback(() => {
        const urlOptions = options ? {...defaultFetchOptions, ...options} : defaultFetchOptions;
        return fetch(url, urlOptions)
        .then(resp => resp.ok ? (resp.json() as T) : resp.json().then(json => Promise.reject(json)))
        .then(response => setData(response))
        .catch(setError)
        .finally(() => setLoading(false));
    }, [url, options]);
    const debouncedFetch = useDebounce(fetchFunction, 2000);

    const callbackMemoized = useCallback(() => {
        setLoading(true);

        if (url.includes('by_name')) {
            debouncedFetch();
        }
        else {
            fetchFunction();
        }
    }, [debouncedFetch, fetchFunction, url]);

    useEffect(() => {
        callbackMemoized();
    }, [callbackMemoized])

    return { loading, error, data };
};