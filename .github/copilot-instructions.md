# Copilot Instructions for Food Bud

## Project Overview
Food Bud is a Progressive Web Application (PWA) for managing recipes and dishes. Users can create, categorize, filter, and browse dishes with a simple and intuitive interface.

## Tech Stack
- **Framework**: SolidJS
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: @solidjs/router
- **Styling**: WindiCSS (via vite-plugin-windicss)
- **Backend**: Firebase (Firestore for database, Firebase Auth for authentication)
- **UI Components**: Custom components with Quill editor for rich text
- **Notifications**: solid-toast
- **Package Manager**: pnpm (can also use npm or yarn)

*Note: Check `package.json` for current dependency versions.*

## Project Structure
```
/src
  /components    - Reusable UI components (Button, Checkbox, Heading, etc.)
  /models        - TypeScript interfaces (dish.interface.ts, category.interface.ts, etc.)
  /pages         - Page components (Home, Login, AddDish, EditDish, etc.)
  /resources     - API resources and Firebase configuration
  /utils         - Utility functions (auth checking, error handling, etc.)
  App.tsx        - Main app component with routing
  index.tsx      - Entry point
```

## Code Style and Conventions

### TypeScript
- Use TypeScript for all new files
- Define interfaces in `/src/models` directory
- Use `.interface.ts` suffix for interface files
- Export interfaces with `I` prefix (e.g., `IDish`, `ICategory`)

### Components
- Use SolidJS functional components with typed Component type imported from 'solid-js'
- Example: `import { Component } from 'solid-js';` then `const MyComponent: Component = () => { ... }`
- For components with props, use: `const MyComponent: Component<Props> = (props) => { ... }`
- Place reusable components in `/src/components`
- Place page components in `/src/pages`
- Use PascalCase for component file names (e.g., `AddDish.tsx`, `Button.tsx`)

### Styling
- Use WindiCSS utility classes for styling
- Follow existing spacing and color patterns (e.g., `bg-violet-50`, `text-black`)
- Responsive design: use md: prefix for medium breakpoints
- Animations: use inline styles with CSS animations for list items

### State Management
- Use SolidJS signals for local state: `createSignal()`
- Use `createEffect()` for side effects
- Use `onMount()` for initialization logic

### Firebase Integration
- Environment variables for Firebase config are prefixed with `VITE_`
- Use Firebase Auth for authentication
- Use Firestore for data storage
- Resources are organized in `/src/resources` directory
- Follow pattern: `[entity]-resource.ts` (e.g., `dish-resource.ts`, `category-resource.ts`)

### Routing
- Use `@solidjs/router` for navigation
- Routes are defined in `App.tsx`
- Use `useNavigate()` hook for programmatic navigation
- Use `Link` component for declarative navigation

## Development Workflow

### Setup
```bash
pnpm install    # or npm install / yarn install
```

### Development
```bash
pnpm dev        # Starts dev server on http://localhost:3000
```

### Build
```bash
pnpm build      # Builds for production to /dist folder
```

### Preview
```bash
pnpm serve      # Preview production build
```

## Best Practices

### When Adding New Features
1. Create interfaces in `/src/models` if new data types are needed
2. Create resource files in `/src/resources` for API/database operations
3. Create reusable components in `/src/components`
4. Create page components in `/src/pages`
5. Add routes in `App.tsx` if new pages are needed
6. Use existing utility functions from `/src/utils` when applicable

### Authentication
- Check authentication status using `checkAuth()` utility
- Protected pages should call `checkAuth()` at the component level
- Use Firebase Auth for login/logout operations

### Error Handling
- Use `handle-error.ts` utility for consistent error handling
- Display errors to users via `solid-toast`

### UI Components
- Reuse existing components (Button, Checkbox, TextInput, etc.) before creating new ones
- Follow existing component patterns for props and styling
- Use Quill editor components for rich text editing

### Data Fetching
- Use resource files for all database operations
- Handle loading states with `Show` component and `Spinner`
- Use `createSignal` with null initial state for async data

## Notes
- The app includes Lithuanian language strings in the UI
- PWA configuration is in `public/manifest.webmanifest`
- Service worker is registered in `index.html`
- Environment variables must be prefixed with `VITE_` to be exposed to the client
