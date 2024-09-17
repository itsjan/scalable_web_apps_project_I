CREATE TABLE users (
  userid TEXT NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE UNIQUE INDEX ON users(lower(email));


-- Add a foreign key constraint to the programming_assignment_submissions table
-- to reference the users table
--
 ALTER TABLE programming_assignment_submissions
   ADD CONSTRAINT fk_user_uuid FOREIGN KEY (user_uuid)
   REFERENCES users (userid);
