-- we only want one pending submission per user
CREATE UNIQUE INDEX unique_pending_submission_per_user
ON programming_assignment_submissions (user_uuid)
WHERE status = 'pending';
