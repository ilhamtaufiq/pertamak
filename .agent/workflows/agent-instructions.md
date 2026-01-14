---
description: Agent instructions and environment configuration for Pertamak project
---

# Environment Configuration

## System
- **OS**: Windows
- **Shell**: PowerShell
- **Package Manager**: Bun

## Commands

### Package Management
// turbo-all
```bash
# Install dependencies
bun install

# Add dependency
bun add <package>

# Add dev dependency  
bun add -d <package>

# Remove dependency
bun remove <package>
```

### Development
```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Type check
bun run tsc --noEmit
```

## Project Structure
- `frontend/` - React + Vite + TailwindCSS v4
- `backend/` - Laravel PHP

## UI Components
This project uses **custom TailwindCSS components** instead of UI libraries.
- Components location: `frontend/src/components/ui/`
- Available: Button, Modal, Card, Spinner, Chip, Avatar, Input, TextArea, Select

## Color Tokens (TailwindCSS)
- `primary` - Main brand color (sky blue)
- `secondary` - Secondary accent
- `default-*` - Neutral grays (100-900)
- `danger` - Error/destructive actions
- `warning` - Warning states
- `success` - Success states

## Important Notes
1. Always use `bun` instead of `npm` or `yarn`
2. Use custom UI components from `./components/ui` instead of external UI libraries
3. Use TailwindCSS for styling
4. Backend API base URL: configured in `frontend/src/lib/api.ts`

---

# MCP Gemini Design

**Gemini is your frontend developer.** For all UI/design work, use this MCP. Tool descriptions contain all necessary instructions.

## Before writing any UI code, ask yourself:

- Is it a NEW visual component (popup, card, section, etc.)? → `snippet_frontend` or `create_frontend`
- Is it a REDESIGN of an existing element? → `modify_frontend`
- Is it just text/logic, or a trivial change? → Do it yourself

## Critical rules:

1. **If UI already exists and you need to redesign/restyle it** → use `modify_frontend`, NOT snippet_frontend.

2. **Tasks can be mixed** (logic + UI). Mentally separate them. Do the logic yourself, delegate the UI to Gemini.
