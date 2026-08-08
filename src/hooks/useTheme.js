import { useCallback, useEffect, useState } from "react";
const STORAGE_KEY = "img-ventory-theme";
function getInitialTheme() {
    if (typeof window === "undefined")
        return "light";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
}
export function useTheme() {
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);
    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }, []);
    return { theme, setTheme, toggleTheme };
}
