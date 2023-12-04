ALTER TABLE traversals RENAME TO visits;

ALTER TABLE visits RENAME COLUMN is_blocked TO is_invalid;
ALTER TABLE visits RENAME column valid_transforms TO valid_tilings;
ALTER TABLE visits RENAME column count_valid_transforms TO count_valid_tilings;

ALTER TABLE visits DROP COLUMN invalid_transforms;
ALTER TABLE visits DROP COLUMN blocked_transforms;
ALTER TABLE visits DROP COLUMN count_blocked_transforms;
ALTER TABLE visits DROP COLUMN count_invalid_transforms;
ALTER TABLE visits DROP COLUMN has_valid_transforms;

ALTER TABLE visits ADD COLUMN count_total_tilings INTEGER NOT NULL DEFAULT 0;


