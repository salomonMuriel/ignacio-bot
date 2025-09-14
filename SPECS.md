# Ignacio Bot Design Specifications

## Color Scheme

### Primary Background Colors
- **Dark Base**: `slate-900` (#0f172a) - Primary dark background
- **Dark Secondary**: `slate-800` (#1e293b) - Secondary dark surfaces
- **Purple Accent**: `purple-900` (#581c87) - Primary purple accent

### Gradient Backgrounds
- **Main Gradient**: `from-slate-900 via-purple-900 to-slate-900`
- **Purple Gradient**: `from-purple-900/50 to-pink-900/50`
- **Slate Overlay**: `slate-800/50` - Semi-transparent overlays

### Text Colors
- **Primary Text**: `white` (#ffffff) - Main headings and important text
- **Secondary Text**: `gray-300` (#d1d5db) - Body text and descriptions
- **Tertiary Text**: `gray-400` (#9ca3af) - Subtle text and hints

### Accent Colors
- **Purple Primary**: `purple-600` (#9333ea) - Main purple for buttons and highlights
- **Purple Hover**: `purple-500` (#a855f7) - Hover state for purple elements
- **Pink Accent**: `pink-600` (#db2777) - Secondary accent color
- **Pink Hover**: `pink-500` (#ec4899) - Hover state for pink elements

### Gradient Text Effects
- **Purple-Pink**: `from-purple-400 via-pink-400 to-indigo-400`
- **Blue-Cyan**: `from-blue-400 to-cyan-400`
- **Yellow-Orange**: `from-yellow-400 to-orange-400`

### Border Colors
- **Subtle Borders**: `slate-700/50` (#334155 at 50% opacity)
- **Purple Borders**: `purple-500/20` (#a855f7 at 20% opacity)
- **Blue Borders**: `blue-500/20` (#3b82f6 at 20% opacity)

### Interactive States
- **Button Primary**: `bg-gradient-to-r from-purple-600 to-pink-600`
- **Button Hover**: `hover:from-purple-500 hover:to-pink-500`
- **Card Hover Borders**: 
  - Purple: `hover:border-purple-500/50`
  - Blue: `hover:border-blue-500/50`
  - Green: `hover:border-green-500/50`

### Background Overlays
- **Glass Effect**: `backdrop-blur-sm` with `bg-slate-800/50`
- **Glow Effects**: Various gradients at 20% opacity for card backgrounds
- **Grid Pattern**: `bg-grid-white/[0.02]` for subtle texture

## Usage Guidelines

### Hierarchy
1. **Primary elements**: Use full white text and purple-pink gradients
2. **Secondary elements**: Use gray-300 text and single accent colors
3. **Tertiary elements**: Use gray-400 text and subtle borders

### Accessibility
- Maintain high contrast ratios with the dark theme
- Use white text for primary content
- Use gray-300 for secondary content to ensure readability

### Consistency
- Use the same gradient combinations across similar UI elements
- Apply consistent hover states and transitions
- Maintain the dark theme throughout the application