# 🧠 Mindware Admin Panel

A premium, state-of-the-art administrative dashboard built for managing companies, subscriptions, and global system configurations. Designed with a focus on performance, scalability, and exceptional UI/UX.

---

## 🚀 Key Features

### 🏢 Company Management

- **Advanced Filtering**: Search by name/email, filter by status (Active/Inactive), and dynamic sorting.
- **Date Range Analysis**: Precise list filtering by creation date ranges.
- **Detailed Insights**: Comprehensive profile view for each company, including legal data, contacts, and related stores.
- **Instant Status Toggle**: Quick activation/deactivation of companies with backend synchronization.

### 💳 Subscription Control

- **Dynamic Pagination**: High-performance list handling using centralized pagination hooks.
- **Status Monitoring**: Real-time tracking of subscription states (Active, Trialing, Past Due, etc.).
- **Proof Verification**: Built-in viewer for payment proof documents.
- **Global Stats**: Aggregated metrics of active subscriptions and system health.

### 🔐 Secure Infrastructure

- **Modular Auth**: Complete authentication flow (Login, Register, Password Recovery) with step-based onboarding.
- **Role-Based Routing**: Protected routes and layout wrappers specifically for administrative access.

---

## 🛠️ Tech Stack

- **Core**: [Next.js 16](https://nextjs.org/) (App Router), [React 18.3](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern CSS-first approach)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query) & [Axios](https://axios-http.com/)
- **URL Search Params**: [nuqs](https://nuqs.47ng.com/) (Type-safe search param hooks)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.stevenly.me/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 🏗️ Architecture Pattern

The project follows a modular and predictable directory structure:

- `src/services`: API abstraction layer using Axios interceptors.
- `src/hooks`: Reusable business logic, including specialized domain hooks (Company, Subscription).
- `src/stores`: Client-side state synchronization with Zustand.
- `src/components`:
  - `ui/`: Raw, accessible foundation components (Radix primitives).
  - `common/`: Shared application-level components (Status Badges, Tables, Modals).
  - `admin/`: Domain-specific components for the administrative area.
- `src/types`: Centralized TypeScript definitions and interfaces.

---

## 🏃 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

---

## 📝 Ongoing Development Notes

- **User Subscription Sync**: Bug identified when fetching user data; subscription details need more granular synchronization.
- **Category Storage**: Planning a centralized store for global categories to optimize re-renders.
