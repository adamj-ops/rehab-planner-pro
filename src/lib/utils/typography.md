# Typography System Documentation

## Base Configuration

Our app uses **14px base font size** (instead of default 16px) to create a tighter, more professional UI suitable for data-dense dashboard applications.

## Available Utility Classes

### Compact Mode
For data-heavy sections that need extra density:

```tsx
<div className="compact">
  {/* All text inside will be 0.9em with tighter line-height */}
</div>
```

**Use for:**
- Financial tables
- Cost breakdowns
- Scope item lists
- Project cards

### Data Dense Mode
For extremely compact layouts:

```tsx
<div className="data-dense">
  {/* Uses text-xs with leading-tight */}
</div>
```

**Use for:**
- Table cells
- List items with lots of data
- Metadata displays
- Secondary information

### Dashboard Cards
Optimized spacing for card-based layouts:

```tsx
<Card className="dashboard-card">
  {/* Tighter vertical spacing with snug line-height */}
</Card>
```

**Use for:**
- Project cards
- Summary cards
- Stat cards
- Info panels

## Typography Scale

With 14px base, the effective sizes are:

- `text-xs` → ~12px
- `text-sm` → ~13px  
- `text-base` → ~14px (default)
- `text-lg` → ~15px
- `text-xl` → ~16px
- `text-2xl` → ~20px
- `text-3xl` → ~26px

## Best Practices

### Dashboard Views
```tsx
<div className="compact">
  <Card className="dashboard-card">
    <CardHeader>
      <CardTitle className="text-lg">Project Name</CardTitle>
    </CardHeader>
    <CardContent className="data-dense">
      {/* Dense data display */}
    </CardContent>
  </Card>
</div>
```

### Forms & Inputs
Use default sizing - no compact classes:
```tsx
<Label className="text-sm">Property Address</Label>
<Input className="text-base" />
```

### Data Tables
```tsx
<table className="data-dense">
  <tbody>
    <tr>
      <td className="text-xs">Item</td>
      <td className="text-sm font-semibold">$1,234</td>
    </tr>
  </tbody>
</table>
```

### Charts & Visualizations
No compact classes - let charts breathe:
```tsx
<div className="p-6">
  <ResponsiveContainer>
    {/* Chart content */}
  </ResponsiveContainer>
</div>
```

## Migration Guide

### Before
```tsx
<div className="text-base">Large text everywhere</div>
```

### After
```tsx
<div className="compact text-sm">Tighter, professional</div>
```

## Component-Specific Guidelines

### Scope Builder
- Use `compact` for scope item cards
- Use `data-dense` for cost breakdown lists

### Dashboard
- Use `dashboard-card` for project cards
- Use `compact` for stat displays

### Final Review
- Use `data-dense` for summary tables
- Regular sizing for charts and headings

### Priority Matrix
- Regular sizing for scatter plot
- `text-sm` for labels
- `data-dense` for item details on hover

