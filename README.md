# Handle Backend

Initial backend setup for Handle using Node.js, Express, TypeScript, Prisma and SQLite.

## Requirements
- Node.js 20+
- npm 10+

## Setup
1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```
4. Run migrations:
   ```bash
   npm run prisma:migrate -- --name init
   ```
5. Seed admin user:
   ```bash
   npm run seed
   ```
6. Start in development:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev`: development server with watch.
- `npm run build`: TypeScript compilation.
- `npm run start`: run compiled server.
- `npm run prisma`: pass-through Prisma CLI.
- `npm run prisma:migrate`: run Prisma migration in development.
- `npm run prisma:generate`: generate Prisma client.
- `npm run seed`: seed initial admin user.

## Project Structure
- `src/modules/users`: auth-protected user administration module.
- `src/modules/units`: units management module with filters and activation/deactivation.
- `src/modules/grades`: grades management module with filters and activation/deactivation.

See `docs/endpoints.md` for endpoint details.
