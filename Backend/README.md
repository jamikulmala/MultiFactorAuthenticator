## Running the backend
Running the backend requires installing Go language from https://golang.org/dl/ and setting it up. go run main.go in the directory to start the server.

## Installing and running postgre
Install postgreSQL from their site and create master user postgre. Set your own password.
pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start to run postgre

## Creating and running the database
```console
psql -U postgres
CREATE DATABASE authenticator;
CREATE TABLE users ( ID SERIAL PRIMARY KEY, first_name VARCHAR(50) NOT NULL, last_name VARCHAR(50) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(128) NOT NULL, email_confirmed BOOLEAN NOT NULL, verification_code VARCHAR(6) NOT NULL );
CREATE TABLE reset_tokens ( ID SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL, token VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
```
# Example view users from the table
```console
\c authenticator
SELECT * FROM users;
```