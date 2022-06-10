CREATE TABLE "users" (
  "id" BIGSERIAL PRIMARY KEY,
  "nik" varchar(16) UNIQUE NOT NULL,
  "role" varchar NOT NULL,
  "password" varchar NOT NULL
);
