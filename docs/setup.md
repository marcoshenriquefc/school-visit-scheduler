# Setup Local

1. `cp .env.example .env`
2. `npm install`
3. `npm run prisma:generate`
4. `npm run prisma:migrate -- --name init`
5. `npm run seed`
6. `npm run dev`
