-- insights_per_minute
CREATE MATERIALIZED VIEW insights_per_minute AS (
  SELECT
    DATE_TRUNC('minute', timestamp) AS minute,
    COUNT(DISTINCT session_id) as count_sessions,
    COUNT(DISTINCT path) AS count_nodes,
    SUM(count_valid_tilings) AS count_valid_tilings,
    SUM(count_total_tilings) AS count_total_tilings,
    MAX(level) AS level
  FROM visits
  GROUP BY minute
  ORDER BY minute
);

CREATE
    UNIQUE INDEX ix_insights_per_minute__minute
    ON insights_per_minute(minute DESC);
-- insights_per_minute END

-- insights_per_level
CREATE MATERIALIZED VIEW insights_per_level AS (
  SELECT
    level,
    ROUND(EXTRACT(epoch FROM MAX(timestamp) - MIN(timestamp)) * 1000)::int AS duration,
    COUNT(DISTINCT path) AS count_nodes,
    SUM(count_valid_tilings) AS count_valid_tilings,
    SUM(count_total_tilings) AS count_total_tilings,
    COUNT(CASE WHEN (has_0 AND count_valid_tilings > 0) THEN 1 END) AS count_valid_has_0,
    COUNT(CASE WHEN (has_3 AND count_valid_tilings > 0) THEN 1 END) AS count_valid_has_3,
    COUNT(CASE WHEN (has_4 AND count_valid_tilings > 0) THEN 1 END) AS count_valid_has_4,
    COUNT(CASE WHEN (has_6 AND count_valid_tilings > 0) THEN 1 END) AS count_valid_has_6,
    COUNT(CASE WHEN (has_8 AND count_valid_tilings > 0) THEN 1 END) AS count_valid_has_8,
    COUNT(CASE WHEN (has_12 AND count_valid_tilings > 0) THEN 1 END) AS count_valid_has_12
  FROM visits
  GROUP BY level
  ORDER BY level
);

CREATE
    UNIQUE INDEX ix_insights_per_level
    ON insights_per_level(level);
-- insights_per_level END

-- insights_per_session
CREATE MATERIALIZED VIEW insights_per_session AS (
  SELECT
    session_id,
    COUNT(DISTINCT path) AS count_nodes,
    SUM(count_valid_tilings) AS count_valid_tilings,
    SUM(count_total_tilings) AS count_total_tilings
  FROM visits
  GROUP BY session_id
);

CREATE
    UNIQUE INDEX ix_insights_per_session__session_id
    ON insights_per_session(session_id);
-- insights_per_session END
