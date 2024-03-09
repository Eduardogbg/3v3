create table if not exists players (
    name text unique not null,
    mmr number not null
);

-- TODO: add amount of players per team to this table?
create table if not exists games (
    -- FIXME: can be null so no check(winning_team_side in ('blue', 'red')),
    winning_team_side text,
    date text not null default (datetime('now'))
);

create table if not exists participants (
    player_id integer not null references players(rowid),
    game_id integer not null references games(rowid),
    -- TODO: change this from result to team side?
    team text not null check(team in ('v', 'd')),
    champion text,

    primary key (player_id, game_id)
);
