ALTER TABLE visits RENAME TO traversals;

ALTER TABLE traversals RENAME COLUMN is_invalid TO is_blocked;
ALTER TABLE traversals RENAME column valid_tilings TO valid_transforms;
ALTER TABLE traversals RENAME column count_valid_tilings TO count_valid_transforms;

ALTER TABLE traversals ADD COLUMN invalid_transforms TEXT NOT NULL;
ALTER TABLE traversals ADD COLUMN blocked_transforms TEXT NOT NULL;
ALTER TABLE traversals ADD COLUMN count_blocked_transforms INT NOT NULL;
ALTER TABLE traversals ADD COLUMN count_invalid_transforms INT NOT NULL;
ALTER TABLE traversals ADD COLUMN has_valid_transforms BOOLEAN NOT NULL;

ALTER TABLE traversals DROP COLUMN count_total_tilings;

