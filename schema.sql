DROP TABLE IF EXISTS jokes;
CREATE TABLE IF NOT EXISTS jokes(
id serial primary key,
type varchar(255),
setup varchar(255),
punchline text
);