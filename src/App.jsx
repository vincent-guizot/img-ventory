import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/providers/QueryProvider";
import { router } from "@/router";
export default function App() {
    return (<QueryProvider>
      <RouterProvider router={router}/>
      <Toaster position="top-right" toastOptions={{
            duration: 3200,
            style: {
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "Manrope, sans-serif",
                boxShadow: "0 8px 24px -6px rgba(15,23,42,0.15)",
            },
            success: { iconTheme: { primary: "#3448FF", secondary: "#fff" } },
        }}/>
    </QueryProvider>);
}
