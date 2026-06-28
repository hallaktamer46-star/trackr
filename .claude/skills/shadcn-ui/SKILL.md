---
name: shadcn-ui
description: "shadcn/ui component reference for Trackr. Use when building or refactoring UI components: buttons, modals, forms, tables, cards, charts, navigation, overlays. Covers all 60+ components, theming with CSS vars, Tailwind v4 integration, and dark mode patterns. Source: https://github.com/shadcn-ui/ui"
---

# shadcn/ui — Component & Theming Reference

Built on Radix UI primitives + Tailwind. Components are copied into your project (not a dependency) — fully customizable.

## Install a component
```bash
pnpm dlx shadcn@latest add <component-name>
```

---

## Full Component List

### Form & Input
| Component | CLI name | Notes |
|-----------|----------|-------|
| Button | `button` | variants: default, destructive, outline, secondary, ghost, link |
| Button Group | `button-group` | grouped button sets |
| Input | `input` | text input |
| Input Group | `input-group` | input with prefix/suffix |
| Input OTP | `input-otp` | one-time password fields |
| Textarea | `textarea` | multiline text |
| Select | `select` | dropdown select (Radix) |
| Native Select | `native-select` | plain HTML select |
| Checkbox | `checkbox` | |
| Radio Group | `radio-group` | |
| Toggle | `toggle` | |
| Toggle Group | `toggle-group` | |
| Combobox | `combobox` | searchable select |
| Label | `label` | accessible form label |
| Field | `field` | form field wrapper with label + error |
| Slider | `slider` | range slider |
| Calendar | `calendar` | date picker calendar |
| Date Picker | `date-picker` | composed calendar + popover |

### Layout & Display
| Component | CLI name | Notes |
|-----------|----------|-------|
| Card | `card` | surface container: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Table | `table` | Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption |
| Data Table | `data-table` | full sortable/filterable table with TanStack Table |
| Tabs | `tabs` | Tabs, TabsList, TabsTrigger, TabsContent |
| Accordion | `accordion` | collapsible sections (single or multiple) |
| Collapsible | `collapsible` | show/hide any content |
| Separator | `separator` | horizontal or vertical divider |
| Scroll Area | `scroll-area` | custom scrollbar |
| Aspect Ratio | `aspect-ratio` | maintain aspect ratios |
| Carousel | `carousel` | swipeable slide carousel |
| Pagination | `pagination` | page navigation |
| Breadcrumb | `breadcrumb` | navigation breadcrumbs |
| Sidebar | `sidebar` | app sidebar with collapsible sections |
| Resizable | `resizable` | drag-resizable panels |
| Typography | `typography` | prose typography classes |
| Badge | `badge` | status/label chips: default, secondary, destructive, outline |
| Alert | `alert` | info/warning/error banners |
| Progress | `progress` | progress bar |
| Skeleton | `skeleton` | loading placeholder |
| Spinner | `spinner` | loading spinner |
| Avatar | `avatar` | user avatar with fallback |
| Kbd | `kbd` | keyboard shortcut display |
| Item | `item` | generic list item |
| Marker | `marker` | list/step markers |
| Empty | `empty` | empty state display |
| Chart | `chart` | Recharts wrapper with shadcn theming |

### Overlay & Popups
| Component | CLI name | Notes |
|-----------|----------|-------|
| Dialog | `dialog` | modal dialog (Radix) |
| Alert Dialog | `alert-dialog` | confirmation dialog |
| Sheet | `sheet` | slide-in panel (from any edge) |
| Drawer | `drawer` | bottom drawer (mobile-friendly) |
| Popover | `popover` | floating content anchor |
| Hover Card | `hover-card` | hover-triggered card |
| Tooltip | `tooltip` | hover tooltip |
| Sonner | `sonner` | toast notifications (Sonner library) |
| Toast | `toast` | built-in toast system |
| Message | `message` | chat-style message bubble |

### Navigation & Menus
| Component | CLI name | Notes |
|-----------|----------|-------|
| Navigation Menu | `navigation-menu` | top-level nav with dropdowns |
| Menubar | `menubar` | desktop-style menu bar |
| Dropdown Menu | `dropdown-menu` | contextual dropdown |
| Context Menu | `context-menu` | right-click menu |
| Command | `command` | command palette (⌘K style) |
| Attachment | `attachment` | file attachment input |
| Bubble | `bubble` | notification bubble |
| Message Scroller | `message-scroller` | auto-scroll message list |

---

## Theming — CSS Variables

shadcn/ui uses **semantic CSS variables** with oklch color space. All components reference these tokens.

### Core Token Pairs (each has a `-foreground` sibling for text on that surface)
```css
--background        /* page background */
--foreground        /* default text */
--card              /* card/panel surface */
--card-foreground
--primary           /* primary action color */
--primary-foreground
--secondary         /* secondary UI elements */
--secondary-foreground
--muted             /* subtle backgrounds */
--muted-foreground  /* placeholder, helper text */
--accent            /* hover/interactive states */
--accent-foreground
--destructive       /* error/danger */
--border            /* dividers, card borders */
--input             /* form control borders */
--ring              /* focus rings */
--chart-1 through --chart-5  /* data viz palette */
```

### Radius Scale
```css
--radius: 0.5rem;   /* base — sm/md/lg/xl/2xl/3xl/4xl derive from this */
```
For Trackr's sharp-corner aesthetic, set `--radius: 0` to eliminate all rounding.

### Dark Mode
Variables are overridden inside `.dark {}` selector. No separate stylesheet needed.

---

## Trackr Integration Notes

- **Tailwind v4**: shadcn fully supports Tailwind v4 as of v2.x. Use `pnpm dlx shadcn@latest init` and pick the Vite + React template.
- **Sharp corners**: Set `--radius: 0` in your CSS to match Trackr's zero-border-radius rule.
- **Dark theme**: Trackr is dark-only — use `.dark` class on `<html>` and configure shadcn dark mode tokens to match: `--background: oklch(7% 0.02 240)` etc.
- **Custom colors**: Override `--primary` to `#00d4ff` (cyan) and adjust chart tokens to match Trackr's status colors.
- **Avoid**: Don't use shadcn's default light-mode assumptions. Always test against Trackr's dark glass bg (`#0d1117`).

---

## Key Patterns

### Modal / Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

### Data Table (with TanStack)
```tsx
import { DataTable } from "@/components/ui/data-table"
// Define columns with ColumnDef<TData>, pass data + columns props
```

### Command Palette
```tsx
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
```

### Toast
```tsx
import { toast } from "sonner"
toast.success("Saved!") | toast.error("Failed") | toast.promise(promise, {...})
```

### Form (with react-hook-form + zod)
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
// Wraps react-hook-form with accessible label/error wiring
```

---

## Reference
- Docs: https://ui.shadcn.com/docs
- Components: https://ui.shadcn.com/docs/components
- Theming: https://ui.shadcn.com/docs/theming
- GitHub: https://github.com/shadcn-ui/ui
