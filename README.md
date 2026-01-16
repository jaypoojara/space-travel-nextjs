# Space Travel Booking Wizard

A 3-step booking wizard for an intergalactic travel agency, built with Next.js 14+ and TypeScript.

## Installation & Running Locally

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## Key Design Decisions

### State Management

**Approach**: Hybrid strategy using URL query parameters + sessionStorage

- **URL Query Parameters** (`?step=1`, `?step=2`, `?step=3`) control navigation state
- **SessionStorage** persists form data across page refreshes

This approach provides:

- Browser back/forward button functionality
- Bookmarkable steps via URL
- Form data persistence without cluttering URLs
- Automatic cleanup when the browser tab closes

### Component Structure

**Organization**: Clear separation between UI primitives and feature components

```
components/
  ui/           # Reusable UI components (Button, Input, Card)
  booking/      # Booking-specific components (Steps, Indicators)

hooks/          # Reusable React hooks (useBookingValidation)
constants/      # Application constants
utils/          # Utility functions (ID generation)
types/          # TypeScript type definitions
lib/            # Business logic (validation, storage)
```

**Principles**:

- UI components are pure and reusable with no business logic
- Feature components contain domain-specific logic
- Custom hooks extract reusable validation logic
- Constants centralize magic numbers and strings
- Type definitions are centralized in `types/`

### Route Validation

The wizard enforces sequential step completion. Users cannot navigate to later steps via URL manipulation until previous steps are validated and completed. This ensures data integrity throughout the booking flow.

## Approach & Tools

### Process

1. **Type-First Development**: Started by defining TypeScript interfaces for all data structures
2. **Component Composition**: Built reusable UI components before feature components
3. **Extraction & Refactoring**: Identified repeated logic (validation, ID generation) and extracted into hooks and utilities
4. **Constants Organization**: Centralized all magic numbers and strings into a constants file
5. **Code Quality**: Maintained strict TypeScript typing (no `any` types), proper import separation, and consistent formatting

### Tools Used

- **Next.js 14+** (App Router): Framework with server/client components
- **React 18**: Hooks-based functional components
- **TypeScript** (strict mode): Type safety throughout
- **Zod**: Schema validation with type inference
- **Tailwind CSS**: Utility-first styling
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Jest**: Testing library

## Feedback on Assignment

This assignment effectively evaluates:

1. **Architectural Decision-Making**: The state management and component structure requirements encourage thoughtful trade-offs
2. **Code Quality**: Emphasis on production-ready patterns (type safety, error handling, validation) reflects real-world expectations
3. **Pragmatic Solutions**: Balancing requirements (URL navigation + state persistence) without over-engineering demonstrates practical problem-solving

**What Worked Well**:

- Clear, realistic requirements that mirror production scenarios
- Focus on code quality and maintainability over feature completeness
- URL-driven navigation requirement adds an interesting technical challenge

**Suggestions**:

- Could benefit from explicit accessibility requirements to ensure inclusive design
- Adding a brief note about expected code organization/style preferences upfront would help align expectations
