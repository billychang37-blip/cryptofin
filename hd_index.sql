CREATE SEQUENCE IF NOT EXISTS hd_wallet_index_seq START 1;

CREATE OR REPLACE FUNCTION get_next_hd_index()
RETURNS integer
LANGUAGE plpgsql
AS $body
DECLARE
    next_idx integer;
BEGIN
    SELECT nextval('hd_wallet_index_seq') INTO next_idx;
    RETURN next_idx;
END;
$body;
