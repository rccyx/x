| Command                                 | Environment        | Purpose                                                                    |
| --------------------------------------- | ------------------ | -------------------------------------------------------------------------- |
| `prisma generate`                       | dev, preview, prod | Generates Prisma client and TypeScript types from schema                   |
| `prisma db push`                        | dev only           | Pushes schema directly to DB without migrations (unsafe for prod)          |
| `prisma migrate dev --name <SOMETHING>` | dev only           | Creates migration files and applies migrations locally; regenerates client |
| `prisma migrate reset`                  | dev, preview       | Drops DB, re-applies migrations, runs seed (never in prod)                 |
| `prisma studio`                         | dev only           | Opens GUI for inspecting and editing DB data                               |
| `prisma format`                         | dev only           | Formats the `schema.prisma` file                                           |
| `prisma db pull`                        | dev only           | Introspects live DB schema into `schema.prisma`                            |
| `prisma migrate deploy`                 | preview, prod      | Applies committed migrations (non-interactive, CI-safe)                    |
| `prisma migrate status`                 | dev                | Shows current DB migration status                                          |
| `prisma migrate diff`                   | dev, CI            | Compares two schema states (used for drift detection)                      |
| `prisma validate`                       | dev, CI            | Validates that `schema.prisma` is syntactically correct                    |

```bash
pnpm --filter @rccyx/db exec prisma migrate diff \
  --from-url="$DATABASE_URL" \
  --to-schema-datamodel=./prisma/schema.prisma \
  --script
```

To spinup the local DB run

```bash
pnpm --filter @rccyx/db start
```
