export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#3448FF",
                    50: "#EEF0FF",
                    100: "#E0E4FF",
                    200: "#C2C9FF",
                    500: "#3448FF",
                    600: "#2536E0",
                    700: "#1C29B3",
                },
                secondary: {
                    DEFAULT: "#6D5EF9",
                    50: "#F1EFFE",
                    100: "#E3DFFD",
                    500: "#6D5EF9",
                    600: "#5847E8",
                },
                surface: {
                    DEFAULT: "#F8FAFC",
                    card: "#FFFFFF",
                },
                border: "#E5E7EB",
            },
            fontFamily: {
                sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            borderRadius: {
                xl: "16px",
                "2xl": "20px",
            },
            boxShadow: {
                soft: "0 2px 8px 0 rgb(15 23 42 / 0.04), 0 1px 2px 0 rgb(15 23 42 / 0.03)",
                card: "0 4px 16px -2px rgb(15 23 42 / 0.06), 0 2px 6px -2px rgb(15 23 42 / 0.04)",
                hover: "0 12px 28px -6px rgb(52 72 255 / 0.14), 0 4px 10px -4px rgb(15 23 42 / 0.08)",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-400px 0" },
                    "100%": { backgroundPosition: "400px 0" },
                },
            },
            animation: {
                shimmer: "shimmer 1.6s linear infinite",
            },
        },
    },
    plugins: [],
};
