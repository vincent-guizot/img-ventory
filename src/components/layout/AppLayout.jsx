import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
export function AppLayout() {
    const [search, setSearch] = useState("");
    const location = useLocation();
    return (<div className="flex min-h-screen bg-surface dark:bg-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar search={search} onSearchChange={setSearch}/>
        <main className="flex-1 px-6 pb-10 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <Outlet context={{ search }}/>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>);
}
