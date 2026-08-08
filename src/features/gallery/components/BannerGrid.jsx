import { motion } from "framer-motion";
import {
  CloudUpload,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
} from "lucide-react";
import windowsCloudImg from "@/assets/windows-cloud.png";

const FEATURES = [
  { icon: CloudUpload, title: "Upload", subtitle: "with ease" },
  { icon: ImageIcon, title: "Organize", subtitle: "your images" },
  { icon: ShieldCheck, title: "Secure", subtitle: "on Cloudinary" },
  { icon: Zap, title: "Fast", subtitle: "& reliable" },
];

export function BannerGrid() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:px-10 lg:px-14 lg:py-6">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-6">
        {/* Left: wordmark, tagline, feature strip */}
        <div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-hover">
              <CloudUpload className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-slate-900 dark:text-white">Img-</span>
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                ventory
              </span>
            </h1>
          </div>

          <p className="mt-3 text-lg font-medium text-slate-500 dark:text-slate-400">
            Store. Upload. Manage.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex flex-col items-start gap-2">
                <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                <div>
                  <p className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">
                    {title}
                  </p>
                  <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
                    {subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: app preview image, pops in with Framer Motion */}
        <motion.div
          className="relative mx-auto hidden max-w-md lg:block"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <motion.img
            src={windowsCloudImg}
            alt="img-ventory app preview"
            className="w-[180px] select-none drop-shadow-2xl"
            draggable={false}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
