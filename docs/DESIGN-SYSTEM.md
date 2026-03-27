# Takovic Design System

Complete reference for the visual design system powering the Takovic financial analysis platform.

---

## Color Tokens

All colors use the `oklch()` color space. Defined in `src/app/globals.css` and mapped to Tailwind via the `@theme inline` block.

### Core

| Token | Tailwind Class | Light | Dark |
|-------|---------------|-------|------|
| `--background` | `bg-background` | `oklch(1 0 0)` | `oklch(0.141 0.005 285.823)` |
| `--foreground` | `text-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0.002 286.375)` |
| `--card` | `bg-card` | `oklch(1 0 0)` | `oklch(0.161 0.008 285.823)` |
| `--card-foreground` | `text-card-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0.002 286.375)` |
| `--popover` | `bg-popover` | `oklch(1 0 0)` | `oklch(0.161 0.008 285.823)` |
| `--popover-foreground` | `text-popover-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0.002 286.375)` |
| `--muted` | `bg-muted` | `oklch(0.967 0.001 286.375)` | `oklch(0.205 0.006 285.823)` |
| `--muted-foreground` | `text-muted-foreground` | `oklch(0.553 0.013 286.067)` | `oklch(0.553 0.013 286.067)` |
| `--border` | `border-border` | `oklch(0.920 0.004 286.32)` | `oklch(0.264 0.006 286.033)` |
| `--input` | `border-input` | `oklch(0.920 0.004 286.32)` | `oklch(0.264 0.006 286.033)` |
| `--ring` | `ring-ring` | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259.815)` |

### Interactive

| Token | Tailwind Class | Light | Dark |
|-------|---------------|-------|------|
| `--primary` | `bg-primary` | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259.815)` |
| `--primary-foreground` | `text-primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` |
| `--secondary` | `bg-secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.205 0.006 285.823)` |
| `--secondary-foreground` | `text-secondary-foreground` | `oklch(0.205 0.006 285.823)` | `oklch(0.985 0.002 286.375)` |
| `--accent` | `bg-accent` | `oklch(0.967 0.001 286.375)` | `oklch(0.205 0.006 285.823)` |
| `--accent-foreground` | `text-accent-foreground` | `oklch(0.205 0.006 285.823)` | `oklch(0.985 0.002 286.375)` |
| `--destructive` | `bg-destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.527 0.227 29.233)` |
| `--destructive-foreground` | `text-destructive-foreground` | `oklch(1 0 0)` | `oklch(0.985 0.002 286.375)` |

### Sidebar

| Token | Tailwind Class | Light | Dark |
|-------|---------------|-------|------|
| `--sidebar` | `bg-sidebar` | `oklch(1 0 0)` | `oklch(0.141 0.005 285.823)` |
| `--sidebar-foreground` | `text-sidebar-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0.002 286.375)` |
| `--sidebar-accent` | `bg-sidebar-accent` | `oklch(0.97 0.014 262)` | `oklch(0.2 0.03 262)` |
| `--sidebar-accent-foreground` | `text-sidebar-accent-foreground` | `oklch(0.546 0.245 262.881)` | `oklch(0.7 0.15 259.815)` |
| `--sidebar-border` | `border-sidebar-border` | `oklch(0.920 0.004 286.32)` | `oklch(0.264 0.006 286.033)` |
| `--sidebar-ring` | `ring-sidebar-ring` | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259.815)` |

### Charts

| Token | Tailwind Class | Light | Dark |
|-------|---------------|-------|------|
| `--chart-1` | `text-chart-1` | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259.815)` |
| `--chart-2` | `text-chart-2` | `oklch(0.627 0.194 163.223)` | `oklch(0.696 0.17 162.48)` |
| `--chart-3` | `text-chart-3` | `oklch(0.769 0.188 85.394)` | `oklch(0.82 0.17 84.429)` |
| `--chart-4` | `text-chart-4` | `oklch(0.585 0.233 293.541)` | `oklch(0.654 0.196 293.541)` |
| `--chart-5` | `text-chart-5` | `oklch(0.577 0.245 27.325)` | `oklch(0.637 0.237 25.331)` |

### Border Radius

| Token | Value |
|-------|-------|
| `--radius` | `0.625rem` (10px) |
| `--radius-sm` | `calc(var(--radius) - 4px)` = 6px |
| `--radius-md` | `calc(var(--radius) - 2px)` = 8px |
| `--radius-lg` | `var(--radius)` = 10px |
| `--radius-xl` | `calc(var(--radius) + 4px)` = 14px |

---

## Typography

### Font Family

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono: ui-monospace, monospace;
```

Set on `<body>` via `font-family: var(--font-sans)`.

### OpenType Features

Enabled globally on `<body>`:

```css
font-feature-settings: "cv02", "cv03", "cv04", "cv11";
```

These are Inter-specific character variants that improve readability of numerals and certain letterforms.

### Font Sizes

| Class | Usage |
|-------|-------|
| `text-xl` | Page titles |
| `text-sm` | Data display, body text, button text, dropdown items |
| `text-xs` | Labels, badges, table headers, tooltip content, small buttons |

### Font Weights

| Class | Usage |
|-------|-------|
| `font-semibold` | Card titles, dropdown labels, badge text |
| `font-medium` | Buttons, tab triggers, table headers |
| (default 400) | Body text, descriptions |

### Tabular Nums

Use the `tabular-nums` class on any element displaying financial numbers to ensure columns of digits align vertically. This gives each numeral equal width, preventing layout jitter when values change.

```tsx
<span className="tabular-nums">{formatCurrency(price)}</span>
```

### Antialiasing

Applied globally via Tailwind's `antialiased` class on `<body>`.

---

## Spacing

| Context | Class | Value |
|---------|-------|-------|
| Page sections | `space-y-6` | 1.5rem (24px) between top-level sections |
| Card grid gaps | `gap-4` | 1rem (16px) between cards in a grid |
| Card padding (header) | `p-6` | 1.5rem (24px) all sides |
| Card padding (content) | `p-6 pt-0` | 1.5rem sides/bottom, 0 top (flush with header) |
| Card padding (footer) | `p-6 pt-0` | Same as content |
| Card header inner | `space-y-1.5` | 0.375rem between title and description |
| Tab content margin | `mt-2` | 0.5rem top margin below tab list |

---

## Components

All UI primitives live in `src/components/ui/`. Built on Radix UI primitives and styled with Tailwind + `class-variance-authority` (CVA). All accept a `className` prop for overrides via `cn()` from `src/lib/utils.ts`.

### 1. Button

**File:** `src/components/ui/button.tsx`
**Exports:** `Button`, `buttonVariants`

**Variants:**

| Variant | Style |
|---------|-------|
| `default` | Solid primary background, white text, shadow |
| `destructive` | Solid red background, white text, shadow-sm |
| `outline` | Border, transparent background, hover fills accent |
| `secondary` | Muted background, dark text, shadow-sm |
| `ghost` | Transparent, hover fills accent |
| `link` | Text-only primary color, underline on hover |

**Sizes:**

| Size | Dimensions |
|------|------------|
| `default` | h-9, px-4, py-2 |
| `sm` | h-8, px-3, text-xs |
| `lg` | h-10, px-8 |
| `icon` | h-9, w-9 (square) |

**Props:** `variant`, `size`, `asChild` (renders as child element via Radix Slot)

```tsx
<Button variant="outline" size="sm">Edit</Button>
<Button asChild><Link href="/stocks">Browse</Link></Button>
```

### 2. Badge

**File:** `src/components/ui/badge.tsx`
**Exports:** `Badge`, `badgeVariants`

**Variants (7):**

| Variant | Style | Use Case |
|---------|-------|----------|
| `default` | Primary bg, white text | General labels |
| `secondary` | Muted bg, dark text | Neutral status |
| `destructive` | Red bg, white text | Errors, critical |
| `outline` | Border only, foreground text | Subtle tags |
| `success` | Green bg/text (light-aware) | Bullish, positive, gains |
| `warning` | Amber bg/text (light-aware) | Caution, mixed signals |
| `danger` | Red bg/text (light-aware) | Bearish, negative, losses |

Base styling: `rounded-md`, `px-2.5 py-0.5`, `text-xs font-semibold`, `border`.

```tsx
<Badge variant="success">Bullish</Badge>
<Badge variant="danger">-5.2%</Badge>
<Badge variant="warning">Hold</Badge>
```

### 3. Card

**File:** `src/components/ui/card.tsx`
**Exports:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

Standard card pattern:
- `Card`: `rounded-xl border border-border bg-card shadow-sm transition-shadow`
- `CardHeader`: `flex flex-col space-y-1.5 p-6`
- `CardTitle`: `font-semibold leading-none tracking-tight`
- `CardDescription`: `text-sm text-muted-foreground`
- `CardContent`: `p-6 pt-0`
- `CardFooter`: `flex items-center p-6 pt-0`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Revenue</CardTitle>
    <CardDescription>Last 4 quarters</CardDescription>
  </CardHeader>
  <CardContent>
    {/* chart or data */}
  </CardContent>
</Card>
```

### 4. Avatar

**File:** `src/components/ui/avatar.tsx`
**Exports:** `Avatar`, `AvatarImage`, `AvatarFallback`

Built on `@radix-ui/react-avatar`. Default size is `h-10 w-10`, circular (`rounded-full`).

- `AvatarImage`: `aspect-square h-full w-full`
- `AvatarFallback`: Centered content on `bg-muted`, shown while image loads or on error

```tsx
<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### 5. Tabs

**File:** `src/components/ui/tabs.tsx`
**Exports:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

Built on `@radix-ui/react-tabs`.

- `TabsList`: `h-9 rounded-lg bg-muted p-1 text-muted-foreground`
- `TabsTrigger`: `rounded-md px-3 py-1 text-sm font-medium`, active state gets `bg-background text-foreground shadow`
- `TabsContent`: `mt-2`, focus ring on keyboard nav

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="financials">Financials</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="financials">...</TabsContent>
</Tabs>
```

### 6. Tooltip

**File:** `src/components/ui/tooltip.tsx`
**Exports:** `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`

Built on `@radix-ui/react-tooltip`.

- `TooltipContent`: `bg-primary text-primary-foreground`, `px-3 py-1.5 text-xs`, `rounded-md`
- Side offset: 4px default
- Animated entrance/exit per side

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Explanation text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 7. Dropdown Menu

**File:** `src/components/ui/dropdown-menu.tsx`
**Exports:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup`

Built on `@radix-ui/react-dropdown-menu`.

- `DropdownMenuContent`: `min-w-[8rem] rounded-md border bg-popover p-1 shadow-md`
- `DropdownMenuItem`: `rounded-sm px-2 py-1.5 text-sm`, focus gets `bg-accent`
- `DropdownMenuLabel`: `px-2 py-1.5 text-sm font-semibold`
- `DropdownMenuSeparator`: `h-px bg-muted`, negative horizontal margin
- SVGs inside items: `size-4 shrink-0`
- Supports `inset` prop for indented items/labels

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 8. Scroll Area

**File:** `src/components/ui/scroll-area.tsx`
**Exports:** `ScrollArea`, `ScrollBar`

Built on `@radix-ui/react-scroll-area`.

- Container: `relative overflow-hidden`
- Viewport: `h-full w-full rounded-[inherit]`
- Scrollbar (vertical): `w-2.5`, transparent left border
- Scrollbar (horizontal): `h-2.5`, transparent top border
- Thumb: `rounded-full bg-border`

```tsx
<ScrollArea className="h-72 w-full">
  {/* long content */}
</ScrollArea>
```

### 9. Separator

**File:** `src/components/ui/separator.tsx`
**Exports:** `Separator`

Built on `@radix-ui/react-separator`.

- Horizontal (default): `h-[1px] w-full bg-border`
- Vertical: `h-full w-[1px] bg-border`
- `decorative` prop defaults to `true`

```tsx
<Separator />
<Separator orientation="vertical" />
```

---

## Tables

Standard table header pattern:

```
text-xs font-medium uppercase tracking-wider text-muted-foreground
```

- Number columns: right-aligned with `text-right tabular-nums`
- Row hover: `hover:bg-muted/50`
- Responsive: hide less important columns with `hidden md:table-cell`

---

## Financial Data Display

### Positive/Negative Coloring

| Condition | Light Mode | Dark Mode |
|-----------|-----------|-----------|
| Positive (gains, bullish) | `text-emerald-600` | `text-emerald-400` |
| Negative (losses, bearish) | `text-red-600` | `text-red-400` |

Use `dark:` prefix for dark mode overrides: `text-emerald-600 dark:text-emerald-400`.

### Formatting Utilities (`src/lib/utils.ts`)

**`formatCurrency(value, currency?, compact?)`**
- Default: `$1,234.56` (Intl.NumberFormat, USD, 2 decimals)
- Compact: `$1.2B`, `$456.7M`, `$12.3K` (for large values)

**`formatPercent(value, decimals?)`**
- Returns `+12.34%` or `-5.20%` (always includes sign)

**`formatNumber(value, compact?)`**
- Default: `1,234,567` (Intl.NumberFormat)
- Compact: `1.2B`, `456.7M`, `12.3K`

**`sentimentColor(sentiment)`**
- Returns `{ text, bg }` class strings for: `bullish`, `somewhat_bullish`, `neutral`, `somewhat_bearish`, `bearish`

**`sentimentLabel(sentiment)`**
- Converts `somewhat_bullish` to `Somewhat Bullish`

**`timeAgo(date)`**
- Returns relative time: `just now`, `5m ago`, `3h ago`, `2d ago`, or formatted date for >7 days

**`cn(...inputs)`**
- Merges Tailwind classes with conflict resolution via `clsx` + `tailwind-merge`

---

## Icons

The project uses `lucide-react` for all icons.

| Context | Size Class | Notes |
|---------|-----------|-------|
| Inline with text | `h-4 w-4` | Default icon size |
| Inside badges | `h-3.5 w-3.5` | Slightly smaller |
| Default color | `text-muted-foreground` | Gray, non-distracting |
| Inside buttons | Auto-sized via `[&_svg]:size-4` | Set by button component |
| Inside dropdown items | Auto-sized via `[&>svg]:size-4` | Set by dropdown component |

---

## Dark Mode

### How It Works

Dark mode is toggled by adding the `.dark` class to the root `<html>` element. All CSS variables are redefined under `.dark {}` in `globals.css`.

The theme preference is stored in `user_preferences.theme` (values: `"system"`, `"light"`, `"dark"`).

### Color Shifts in Dark Mode

- Backgrounds shift from white to very dark blue-gray
- Cards get slightly lighter than the background (`0.161` vs `0.141` lightness) for subtle elevation
- Primary color shifts from deeper blue (`0.546`) to brighter blue (`0.623`) for readability
- Borders shift from light gray to dark gray
- Muted foreground remains the same value in both themes (mid-gray)
- Chart colors shift to higher lightness values for visibility on dark backgrounds
- Success/warning/danger badges use `dark:` variants with reduced opacity backgrounds (`bg-green-900/30`) and lighter text

### Things to Watch For

- Always pair light and dark colors: `text-emerald-600 dark:text-emerald-400`
- The `bg-card` and `bg-background` are the same in light mode but differ in dark mode -- use `bg-card` for elevated surfaces
- Sidebar accent uses a blue-tinted background in both themes, not the neutral muted color
- Never hardcode hex or oklch colors in components; always use token classes
