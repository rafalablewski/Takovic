import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  User,
  Settings,
  Bell,
  CreditCard,
  Check,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/user";

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const notificationSettings = [
  {
    id: "price-alerts",
    label: "Price Alerts",
    description:
      "Get notified when a stock hits your target price or moves significantly.",
    enabled: true,
  },
  {
    id: "earnings-reminders",
    label: "Earnings Reminders",
    description:
      "Receive reminders before earnings announcements for watchlisted stocks.",
    enabled: true,
  },
  {
    id: "ai-analysis",
    label: "AI Analysis Updates",
    description:
      "Notifications when new AI-powered analysis is available for your stocks.",
    enabled: false,
  },
  {
    id: "portfolio-summary",
    label: "Portfolio Daily Summary",
    description:
      "A daily digest of your portfolio performance sent each evening.",
    enabled: true,
  },
  {
    id: "weekly-digest",
    label: "Weekly Market Digest",
    description:
      "A comprehensive weekly summary of market trends and your portfolio.",
    enabled: false,
  },
];

const planFeatures = [
  "Unlimited stock analyses",
  "AI-powered insights (Claude Sonnet 4.6)",
  "Real-time price alerts",
  "Advanced screener filters",
  "Portfolio tracking (up to 5 portfolios)",
  "Export to CSV / PDF",
  "Priority support",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const planPricing: Record<string, string> = {
  free: "Free",
  professional: "$29/month",
  enterprise: "$99/month",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-1.5 h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* ---- Profile Tab ---- */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <CardDescription className="text-xs">
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
              {/* Avatar + plan */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
                  {user.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant="default" className="mt-1 text-[10px]">
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  type="text"
                  className={inputClass}
                  defaultValue={user.name}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  className={inputClass}
                  defaultValue={user.email}
                />
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-0">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---- Preferences Tab ---- */}
        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm font-medium">Preferences</CardTitle>
              <CardDescription className="text-xs">
                Customize your Takovic experience
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-5">
              {/* Default Currency */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Default Currency
                </label>
                <select className={selectClass} defaultValue="USD">
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                  <option value="CAD">CAD — Canadian Dollar</option>
                </select>
              </div>

              {/* Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Theme
                </label>
                <div className="flex gap-2">
                  {["System", "Light", "Dark"].map((theme) => (
                    <button
                      key={theme}
                      className={`h-9 rounded-md border px-4 text-sm font-medium transition-colors ${
                        theme === "System"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Screener Sector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Default Screener Sector
                </label>
                <select className={selectClass} defaultValue="technology">
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="financials">Financials</option>
                  <option value="energy">Energy</option>
                  <option value="consumer">Consumer Discretionary</option>
                  <option value="industrials">Industrials</option>
                  <option value="all">All Sectors</option>
                </select>
              </div>

              {/* Dashboard Layout */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Dashboard Layout
                </label>
                <div className="flex gap-2">
                  {["Compact", "Standard"].map((layout) => (
                    <button
                      key={layout}
                      className={`h-9 rounded-md border px-4 text-sm font-medium transition-colors ${
                        layout === "Standard"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-0">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---- Notifications Tab ---- */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm font-medium">
                Notifications
              </CardTitle>
              <CardDescription className="text-xs">
                Choose which notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <div className="divide-y divide-border/50">
                {notificationSettings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {setting.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {setting.description}
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        setting.enabled
                          ? "bg-primary"
                          : "bg-muted-foreground/25"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                          setting.enabled
                            ? "translate-x-[18px]"
                            : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Billing Tab ---- */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Current Plan
                </CardTitle>
                <Badge variant="default" className="text-[10px]">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {planPricing[user.plan] ?? "Free"}
                </p>
              </div>

              <Separator />

              <ul className="space-y-2">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment & Billing Details */}
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm font-medium">
                Billing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    No payment method on file
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Next Billing Date
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    &mdash;
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-0">
              <Button variant="outline">Manage Subscription</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
