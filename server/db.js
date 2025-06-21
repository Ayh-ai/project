//https://neon.com/postgresql/postgresql-administration/psql-commands
/*
Step 1: Install PostgreSQL (includes pgAdmin)
Go to the official site:
👉 https://www.postgresql.org/download/windows/

Click on "Download the installer" from EDB.

Run the installer:

Choose your installation directory.

Set a password for the default superuser (postgres). Remember this!

Leave default port: 5432.

Make sure pgAdmin 4 is checked in components.

Finish installation.

✅ Step 2: Launch pgAdmin
Open pgAdmin 4 from the Start Menu.

The first time, you’ll set a master password (this is only for pgAdmin).

Right-click "Servers" → Create → Server:

Name: Local

Connection tab:

Host: localhost

Username: postgres

Password: (the one you chose during installation)


//
node ./server/index.js

psql -U your_pg_user

CREATE DATABASE "DataInsights";

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


*/
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "YOUR_DATABASE_NAME",
  password: "YOUR_PG_ADMIN_PASSWORD",
  port: 5432,
});

export default pool;
