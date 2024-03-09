use serde::{Deserialize, Serialize};
use sqlsync_reducer::{execute, init_reducer, types::ReducerError};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "tag")]
enum Mutation {
    InitSchema,
    AddPlayer {
        id: String,
        name: String,
        mmr: i32,
    },
    AddGame {
        id: String,
        date: String,

        winning_team_players: Vec<(String, Option<String>)>,
        losing_team_players: Vec<(String, Option<String>)>,

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

        Mutation::AddPlayer { id, name, mmr } => {
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
            id,
            date,
            winning_team_side,
            winning_team_players,
            losing_team_players,
        } => {
            log::info!("appending game {}", id);
            execute!(
                "insert into games (id, date, winning_team_side) values (?, ?, ?)",
                id.clone(),
                date,
                winning_team_side
            )
            .await?;

            let participants = winning_team_players
                .iter()
                .map(|(player_id, champion)| (player_id, champion, "v"))
                .chain(
                    losing_team_players
                        .iter()
                        .map(|(player_id, champion)| (player_id, champion, "d")),
                );

            // TODO: doing this iterator stuff has me cloning stuff, maybe I should just do 2 loops
            for (player_id, champion, team_result) in participants {
                execute!(
                    "insert into participants (game_id, player_id, team, champion) values (?, ?, ?, ?)",
                    id.clone(),
                    player_id.clone(),
                    team_result,
                    champion.clone()
                ).await?;
            }
        }
    }

    Ok(())
}
