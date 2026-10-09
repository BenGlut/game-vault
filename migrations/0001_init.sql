-- GameVault D1 schema. One table per data/*.json file of the private repo.
-- Each row keeps the full Zod-validated record in `data` (JSON); the other
-- columns are generated from it so lookups stay indexed without duplicating truth.

CREATE TABLE platforms (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data))
);

CREATE TABLE games (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data)),
  platform_id TEXT GENERATED ALWAYS AS (json_extract(data, '$.platformId')) VIRTUAL,
  normalized_title TEXT GENERATED ALWAYS AS (json_extract(data, '$.normalizedTitle')) VIRTUAL
);
CREATE INDEX games_platform ON games (platform_id);
CREATE INDEX games_title ON games (normalized_title);

CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data)),
  game_id TEXT GENERATED ALWAYS AS (json_extract(data, '$.gameId')) VIRTUAL,
  status TEXT GENERATED ALWAYS AS (json_extract(data, '$.status')) VIRTUAL,
  order_id TEXT GENERATED ALWAYS AS (json_extract(data, '$.orderId')) VIRTUAL
);
CREATE INDEX inventory_game ON inventory (game_id);
CREATE INDEX inventory_status ON inventory (status);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data)),
  status TEXT GENERATED ALWAYS AS (json_extract(data, '$.status')) VIRTUAL,
  ordered_at TEXT GENERATED ALWAYS AS (json_extract(data, '$.orderedAt')) VIRTUAL
);
CREATE INDEX orders_status ON orders (status);

CREATE TABLE sellers (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data))
);

CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data))
);

CREATE TABLE price_observations (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data)),
  game_id TEXT GENERATED ALWAYS AS (json_extract(data, '$.gameId')) VIRTUAL
);
CREATE INDEX price_observations_game ON price_observations (game_id);

CREATE TABLE evidence (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data))
);

CREATE TABLE change_log (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL CHECK (json_valid(data)),
  at TEXT GENERATED ALWAYS AS (json_extract(data, '$.at')) VIRTUAL
);
CREATE INDEX change_log_at ON change_log (at);
