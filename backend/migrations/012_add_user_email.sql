-- Migration: add emails

BEGIN;

ALTER TABLE users
ADD COLUMN email TEXT UNIQUE;

COMMIT;