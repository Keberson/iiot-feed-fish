-- Create custom types
CREATE TYPE feeding_status AS ENUM ('done', 'planned', 'in-progress', 'error');
CREATE TYPE log_type AS ENUM ('cart', 'bunker', 'system');
CREATE TYPE system_status AS ENUM ('error', 'warning', 'ok');

-- Create pools table
CREATE TABLE pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    additional JSONB
);

-- Create feeds table
CREATE TABLE feeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    additional JSONB
);

-- Create timetable table
CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    additional JSONB
);

-- Create feeding table
CREATE TABLE feeding (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER REFERENCES pools(id) NOT NULL,
    feed_id INTEGER REFERENCES feeds(id) NOT NULL,
    weight NUMERIC NOT NULL,
    period_id INTEGER REFERENCES timetable(id) NOT NULL,
    status feeding_status NOT NULL DEFAULT 'planned',
    result JSONB
);

-- Create logs table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    type log_type NOT NULL
);

-- Create system table
CREATE TABLE system (
    id SERIAL PRIMARY KEY,
    wifi_ssid VARCHAR(255),
    wifi_password VARCHAR(255),
    status system_status NOT NULL DEFAULT 'ok'
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    jwt VARCHAR(255),
    fullname VARCHAR(255) NOT NULL
);

-- Add UUID-based IDs to tables
ALTER TABLE pools ADD COLUMN uuid VARCHAR(50) DEFAULT 'pool-' || md5(random()::text)::uuid;
ALTER TABLE feeds ADD COLUMN uuid VARCHAR(50) DEFAULT 'feed-' || md5(random()::text)::uuid;
ALTER TABLE timetable ADD COLUMN uuid VARCHAR(50) DEFAULT 'timetable-' || md5(random()::text)::uuid;
ALTER TABLE feeding ADD COLUMN uuid VARCHAR(50) DEFAULT 'feeding-' || md5(random()::text)::uuid;
ALTER TABLE logs ADD COLUMN uuid VARCHAR(50) DEFAULT 'log-' || md5(random()::text)::uuid;
ALTER TABLE users ADD COLUMN uuid VARCHAR(50) DEFAULT 'user-' || md5(random()::text)::uuid;
