import { Sun, Moon, Info, Cloud } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoRow } from "@/components/shared/InfoRow";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
const APP_VERSION = "v1.0.0";
export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-6 pt-1">
      <PageHeader
        title="Settings"
        description="Manage your preferences and Cloudinary configuration."
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border dark:border-slate-800 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Appearance
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Customize the look and feel of the application.
          </p>
        </div>
        <InfoRow
          icon={theme === "light" ? Sun : Moon}
          title="Theme"
          description="Choose between light and dark mode."
          action={
            <div className="flex justify-end gap-2 sm:justify-start">
              <Button
                variant={theme === "light" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </Button>
            </div>
          }
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border dark:border-slate-800 px-6 py-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            About
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Application information.
          </p>
        </div>
        <InfoRow
          icon={Info}
          title="Version"
          description="Current application version."
          action={
            <div className="flex justify-end sm:justify-start">
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {APP_VERSION}
              </Badge>
            </div>
          }
        />
        <InfoRow
          icon={Cloud}
          title="img-ventory"
          description="A lightweight Cloudinary image upload manager."
          action={<div />}
        />
      </Card>
    </div>
  );
}
