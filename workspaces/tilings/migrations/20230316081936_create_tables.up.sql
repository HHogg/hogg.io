CREATE TABLE state (
  key VARCHAR PRIMARY KEY,
  value VARCHAR NOT NULL
);

INSERT INTO state (key, value) VALUES ('path', '3');
INSERT into state (key, value) VALUES ('path_index', '0');

CREATE TABLE tilings (
  notation VARCHAR PRIMARY KEY,
  hash VARCHAR(255) NOT NULL,
  path VARCHAR NOT NULL,
  path_index INTEGER NOT NULL,
  transform_index INTEGER NOT NULL,
  has_0 BOOLEAN NOT NULL,
  has_3 BOOLEAN NOT NULL,
  has_4 BOOLEAN NOT NULL,
  has_6 BOOLEAN NOT NULL,
  has_8 BOOLEAN NOT NULL,
  has_12 BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visits (
  path VARCHAR PRIMARY KEY,
  index INTEGER NOT NULL,
  level INT NOT NULL,
  is_invalid BOOLEAN NOT NULL,
  valid_tilings TEXT NOT NULL,
  count_valid_tilings INT NOT NULL,
  count_total_tilings INTEGER NOT NULL,
  has_0 BOOLEAN NOT NULL,
  has_3 BOOLEAN NOT NULL,
  has_4 BOOLEAN NOT NULL,
  has_6 BOOLEAN NOT NULL,
  has_8 BOOLEAN NOT NULL,
  has_12 BOOLEAN NOT NULL,
  session_id VARCHAR NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE errors (
  tiling VARCHAR PRIMARY KEY,
  reason TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE sys_info AS (
  hostname TEXT,
  os TEXT,
  os_version TEXT,
  cpu TEXT,
  ip_address TEXT
);

CREATE TABLE sessions (
  id VARCHAR PRIMARY KEY,
  worker_count INT NOT NULL,
  sys_info sys_info NOT NULL,
  timestamp_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  timestamp_stop TIMESTAMP
);

