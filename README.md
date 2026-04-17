# Express Backend (Port 5000)

## Database

1. Create a PostgreSQL database (e.g. `projectdevobs`).
2. Apply the schema and seed data:

```sh
psql -U postgres -d projectdevobs -f ../database/schema.sql
```

3. Configure the API (copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` or `PG*` variables).
4. Set admin login credentials if you want values different from the defaults:

```sh
ADMIN_IDENTIFIER=admin
```

## Run

```sh
npm install
npm start
```

Server runs on `http://localhost:5000` (override with `PORT`).

## APIs

### 0) Login

`POST /api/auth/login`

Admin example:

```json
{
  "role": "admin",
  "identifier": "admin"
}
```

User example:

```json
{
  "role": "user",
  "identifier": "101"
}
```

Seeded demo user IDs:

- customer id `101`
- customer id `202`

### 0.1) Register

`POST /api/auth/register`

```json
{
  "customerId": "303",
  "name": "New User",
  "provider": "TataSky",
  "planId": 1
}
```

### 1) Get user by id

`GET /api/user/:id`

`id` can be the numeric `users.id` or `users.customer_id` (e.g. `1` or `101`).

Example:

```sh
curl http://localhost:5000/api/user/1
```

Returns:

- `200` with `{ id, customerId, name, provider, plan, packPrice }` when found (`packPrice` is the subscriber’s base monthly pack in INR)
- `404` with `{ "message": "User not found" }` when not found

### 2) Catalog (plans, channels & addons)

`GET /api/catalog`

Returns `{ plans: [{ id, name, packPrice }], channels: [{ id, name, price }], addons: [...] }`.

### 3) Customize

`POST /api/customize`

Body (example):

```json
{
  "id": "1",
  "planId": 1,
  "selectedChannels": ["Sports", "Movies"],
  "addons": ["HD Pack"]
}
```

Optional **`planId`**: id from `GET /api/catalog` → `plans`. If omitted or invalid, the user’s stored `packPrice` is used.

Persists `user_customizations` (including `plan_id`), `customization_channels`, and `customization_addons`.  
`total_price` is **selected plan pack + channels + addons** (`data.selectedPlan`, `data.packPrice`, etc.).

### 4) List subscribers

`GET /api/users`

Returns `{ users: [...] }` for the admin dashboard view.
