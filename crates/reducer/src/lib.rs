use serde::{Deserialize, Serialize};
use sqlsync_reducer::{
    execute, init_reducer,
    types::{ReducerError, SqliteValue},
};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
enum TeamResult {
    // TODO: consider using 'V' and 'D' on the db (or make it case-insensitive)
    #[serde(rename = "v")]
    V,
    #[serde(rename = "d")]
    D,
}

impl From<TeamResult> for SqliteValue {
    fn from(value: TeamResult) -> Self {
        match value {
            TeamResult::V => "v".into(),
            TeamResult::D => "d".into(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct GamePlayer {
    player_id: String,
    champion: Option<String>,
    team: TeamResult,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "tag")]
enum Mutation {
    InitSchema,
    CreatePlayer {
        id: String,
        name: String,
        mmr: i32,
    },
    AddGame {
        id: String,

        date: String,
        players: Vec<GamePlayer>,

        winning_team_side: Option<String>,
    },
}

init_reducer!(reducer);
async fn reducer(mutation: Vec<u8>) -> Result<(), ReducerError> {
    let mutation: Mutation = serde_json::from_slice(&mutation[..])?;

    match mutation {
        Mutation::InitSchema => {
            // README: https://discord.com/channels/1149205110262595634/1216750158449086464
            // execute!(include_str!("../../../packages/db/migrations/schema.sql")).await?;
            execute!(
                r#"create table if not exists players (
                id text primary key not null,
                name text unique not null,
                mmr number not null
            );"#
            )
            .await?;
            execute!(
                r#"create table if not exists games (
                id text primary key not null,
                date text not null default (datetime('now')),
                winning_team_side text
            );"#
            )
            .await?;
            execute!(
                r#"create table if not exists participants (
                game_id text not null references games(id),
                player_id text not null references players(id),
                team text not null check(team in ('v', 'd')),
                champion text,

                primary key (game_id, player_id)
            );"#
            )
            .await?;
        }

        Mutation::CreatePlayer { id, name, mmr } => {
            log::info!("appending player {}", id);
            execute!(
                "insert into players (id, name, mmr) values (?, ?, ?)",
                id,
                name,
                mmr
            )
            .await?;
        }

        Mutation::AddGame {
            id: game_id,
            date,
            winning_team_side,
            players,
        } => {
            log::info!("appending game {}", game_id);
            log::info!("players: {:?}", players);

            log::info!(
                "debugging winning_team_side {:?}",
                SqliteValue::from(winning_team_side.clone())
            );

            let result = execute!(
                "insert into games (id, date, winning_team_side) values (?, ?, ?)",
                game_id.clone(),
                date,
                winning_team_side
            )
            .await?;

            log::info!("deu certo");

            for game_player in players {
                log::info!(
                    "appending game player {} {} {:?}",
                    game_id,
                    game_player.player_id,
                    SqliteValue::from(game_player.team)
                );
                execute!(
                    "insert into participants (game_id, player_id, team, champion) values (?, ?, ?, ?)",
                    game_id.clone(),
                    game_player.player_id.clone(),
                    game_player.team,
                    game_player.champion.clone()
                ).await?;
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlsync_reducer::types::SqliteValue;

    #[test]
    fn test_structs_serialization() {
        let game_player = GamePlayer {
            player_id: "player_id".to_string(),
            champion: Some("champion".to_string()),
            team: TeamResult::V,
        };

        let add_game_mutation = Mutation::AddGame {
            id: "game_id".to_string(),
            date: "2023-01-01".to_string(),
            winning_team_side: Some("blue".to_string()),
            players: vec![game_player],
        };

        assert_eq!(
            serde_json::to_string(&add_game_mutation).unwrap(),
            r#"{"tag":"AddGame","id":"game_id","date":"2023-01-01","players":[{"player_id":"player_id","champion":"champion","team":"v"}],"winning_team_side":"blue"}"#
        );
    }
}
