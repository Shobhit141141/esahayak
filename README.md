## Database Setup & Prisma

### 1. Configure Database URL

Set your PostgreSQL connection string in `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 2. Run Migrations & Generate Client

Run the following command to set up the database and generate Prisma client:

```
npm run db:setup
```

This will:

- Run migrations (`prisma migrate dev`)
- Generate Prisma client (`prisma generate`)

### 3. Open Prisma Studio (Optional)

To view and edit your data in a browser:

```
npm run prisma:studio
```

### 4. Customizing Models

Edit your data models in `prisma/schema.prisma` and re-run `npm run db:setup` to apply changes.

---
