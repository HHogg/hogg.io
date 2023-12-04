CREATE TABLE state (
  key VARCHAR PRIMARY KEY,
  value VARCHAR NOT NULL
);

INSERT INTO state (key, value) VALUES ('current_path', '3');

CREATE TABLE tilings (
  notation VARCHAR PRIMARY KEY,
  score INT NOT NULL,
  has_0 BOOLEAN NOT NULL,
  has_3 BOOLEAN NOT NULL,
  has_4 BOOLEAN NOT NULL,
  has_6 BOOLEAN NOT NULL,
  has_8 BOOLEAN NOT NULL,
  has_12 BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE traversals (
  path VARCHAR PRIMARY KEY,
  score INT NOT NULL,
  level INT NOT NULL,
  is_blocked BOOLEAN NOT NULL,
  valid_transforms TEXT NOT NULL,
  invalid_transforms TEXT NOT NULL,
  blocked_transforms TEXT NOT NULL,
  count_valid_transforms INT NOT NULL,
  count_invalid_transforms INT NOT NULL,
  count_blocked_transforms INT NOT NULL,
  has_0 BOOLEAN NOT NULL,
  has_3 BOOLEAN NOT NULL,
  has_4 BOOLEAN NOT NULL,
  has_6 BOOLEAN NOT NULL,
  has_8 BOOLEAN NOT NULL,
  has_12 BOOLEAN NOT NULL,
  has_valid_transforms BOOLEAN NOT NULL,
  session_id VARCHAR NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE errors (
  path VARCHAR PRIMARY KEY,
  error TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE sys_info AS (
  hostname TEXT,
  os TEXT,
  os_version TEXT,
  cpu TEXT
);

CREATE TABLE sessions (
  id VARCHAR PRIMARY KEY,
  ip_address TEXT NOT NULL,
  worker_count INT NOT NULL,
  sys_info sys_info NOT NULL,
  timestamp_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  timestamp_stop TIMESTAMP
);
