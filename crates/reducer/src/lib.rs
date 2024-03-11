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
            execute!(include_str!("../../../packages/db/migrations/schema.sql")).await?;
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
            .await;

            match result {
                Ok(_) => (),
                Err(err) => {
                    match err {
                        sqlsync_reducer::types::ErrorResponse::SqliteError { code, message } => {
                            log::error!("sqlite error: {}", message);
                            log::error!("sqlite error code: {}", code);
                        }
                        sqlsync_reducer::types::ErrorResponse::Unknown(e) => {
                            log::error!("unknown error: {:?}", e);
                        }
                    }

                    return Err(ReducerError::ConversionError {
                        value: SqliteValue::from("mentira esse erro fui eu que criei hehe "),
                        target_type: "String".to_owned(),
                    });
                }
            }
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
