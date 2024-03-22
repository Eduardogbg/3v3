```tsx

import { SortableTree, SimpleTreeItemWrapper, TreeItem } from 'dnd-kit-sortable-tree'
import { rectSortingStrategy } from '@dnd-kit/sortable'
export function GamePreview({ addGameForm, players }: GamePreviewProps) {
    /*
    Needs a column for each team, a row for each player preview
    This component will preview each player.
    */

    // const winningTeamPlayers = addGameForm.values.players.filter(p => p.team == 'v')
    // const losingTeamPlayers = addGameForm.values.players.filter(p => p.team == 'd')


    //
    const data = addGameForm.values.players.map(gamePlayer => ({
        gamePlayer,
        player: players.find(p => p.id == gamePlayer.player_id)!,
    }))

    type Item = {
        id: string
        /*
            TODO: this sucks because I don't want an uniform tree: containers
            and items have different values
        */
        value: TeamResult | {
            gamePlayer: GamePlayer,
            player: Player
        }
    }

    const items: TreeItem<Item>[] = (['v', 'd'] as const).map(teamResult => ({
        id: teamResult,
        value: teamResult,
        children: data.filter(d => d.gamePlayer.team == teamResult).map(d => ({
            id: d.player.id,
            value: {
                gamePlayer: d.gamePlayer,
                player: d.player,
            }
        }))
    }))

    return (
        <SortableTree<Item>
            items={items}
            onItemsChanged={(items, reason) => {
                const newPlayers: GamePlayer[] = items
                    .flatMap(item => item.children
                        ?.map(child => typeof child.value !== 'string'
                            ? child.value.gamePlayer
                            : (() => { throw 'unreachable' })()
                        ) ?? []
                    ) ?? []

                console.log({ items, newPlayers })

                addGameForm.setValues({
                    ...addGameForm.values,
                    // TODO: later I can refactor the form so less dynamic shit that needs
                    // dependent types to check is required
                    players: newPlayers,
                })
            }}
            TreeItemComponent={forwardRef(({ item, ...props }, ref) => (
                <SimpleTreeItemWrapper
                    {...props}
                    item={item}
                    ref={ref}
                >
                    {
                        typeof item.value !== 'string'
                            ? <PlayerPreview player={item.value.player} gamePlayer={item.value.gamePlayer} />
                            : item.value
                    }
                </SimpleTreeItemWrapper>
            ))}
        />
    )
}
```