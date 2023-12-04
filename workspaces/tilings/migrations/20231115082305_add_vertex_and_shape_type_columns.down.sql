ALTER TABLE tilings DROP COLUMN vertex_types;
ALTER TABLE tilings DROP COLUMN shape_types;

ALTER TABLE tilings ADD COLUMN vertex TEXT NOT NULL;
