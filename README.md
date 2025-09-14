# 🚀 Esahayak Leads

## Buyers/leads managemnt platform

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Unit test](#-unit-test)

## 🧰 Tech Stack (badges)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-000000?style=for-the-badge&logo=zod&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![Mantine](https://img.shields.io/badge/Mantine-339AF0?style=for-the-badge&logo=mantine&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- **Demo Login with cookies**: Simple authentication using cookies
- **Import/Export by CSV**: data import/export functionality
- **Type Safety**: Fully typed database operations
- **ZOD validation**: Schema validation with Zod
- **Buyers Managementes**: CRUD operations for managing buyers with filters/sorting/pagination
- **Column specific sorting**: sort and filter data in tables for specific columns
- **Buyers history**: Track and view the history of buyer interactions
- **Admin/Agent Roles**: Different access levels for admins and agents
- **Concurrency Handling**: simultaneous data operations are managed
- **Error Boundaries**: Graceful error handling in components/pages.
- **Rate limiting using REDIS+IP**: based on requests by IP per minute.
- **Unit Testing**: Basic unit test setup with Jest.

## 🛠 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git installed
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Shobhit141141/esahayak.git
cd esahayak
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy a `.env.sample` in `.env` file at the root of your project and configure the following environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

### 4. Set Up the Database

Run the following commands to set up your database schema and generate the Prisma client:

```bash
npm run db:setup
```

This will:

- Run migrations (prisma migrate dev)
- Generate Prisma client (prisma generate)

### 5.Open prisma studio (Optional)

```bash
npm run prisma:studio
```

### 6. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the application in action.

## 🧪 Unit Test

### 1. Create a Test File

Create a test file in the `utils/__tests__` directory (e.g., `__tests__/example.test.tsx`).

### 2. Write a Test

```tsx
import { render, screen } from "@testing-library/react";
import ExampleComponent from "../components/ExampleComponent";

test("renders example component", () => {
  render(<ExampleComponent />);
  expect(screen.getByText(/example/i)).toBeInTheDocument();
});
```

### 3. Run Tests

```bash
npx jest
```
