import { useCallback, useEffect, useRef, useState } from 'react'
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
    CollisionDetection, DndContext, DragOverlay, DropAnimation, MeasuringStrategy, MouseSensor, TouchSensor, KeyboardSensor,
    UniqueIdentifier, closestCenter, defaultDropAnimationSideEffects, getFirstCollision, pointerWithin, rectIntersection,
    useSensor, useSensors
} from '@dnd-kit/core'
import { PlayerPreview } from './player-preview'
import { TeamPreview } from './team-preview'
import type { GamePlayer, Player, TeamResult } from '../../types'
import { createPortal } from 'react-dom'
import { coordinateGetter } from './keyboard-coordinates'
import { Flex, Group } from '@mantine/core'


interface GamePreviewProps {
    gamePlayers: GamePlayer[]
    setGamePlayers: (gps: GamePlayer[]) => void
    players: Player[]
}

// TODO: test suite for this function
function moveIndex<T>(array: T[], from: number, to: number): T[] {
    const clone = [...array]
    const active = clone.splice(from, 1)[0]
    clone.splice(to, 0, active)

    return clone
}

const CONTAINER_IDS = ['v', 'd'] as const

export const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
}

export function GamePreview({ players, gamePlayers, setGamePlayers }: GamePreviewProps) {
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, { coordinateGetter })
    )

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
    const [clonedGamePlayers, setClonedGamePlayers] = useState<GamePlayer[] | null>(null)

    useEffect(() => {
        if (activeId) {
            document.body.style.cursor = 'grabbing'

            // TODO: do this in the else branch instead?
            return () => {
                document.body.style.cursor = ''
            }
        }
    }, [activeId])

    const lastOverRef = useRef<UniqueIdentifier | null>(null)
    const recentlyMovedToNewContainer = useRef(false)
    const isSortingContainer = activeId ? isContainer(activeId) : false

    useEffect(
        () => {
            requestAnimationFrame(() => {
                recentlyMovedToNewContainer.current = false
            })
        },
        // TODO: revisit this dependency array (I think the reference shouldn't change...)
        [gamePlayers]
    )

    // TODO: hard to refactor this without passing a ton of args
    const collisionDetectionStrategy: CollisionDetection = useCallback(args => {
        if (isContainer(activeId)) {
            return closestCenter({
                ...args,
                droppableContainers: args.droppableContainers.filter(
                    (container) => isContainer(container.id)
                ),
            })
        }

        // Start by finding any intersecting droppable
        const pointerIntersections = pointerWithin(args)
        const intersections =
            pointerIntersections.length > 0
                ? // If there are droppables intersecting with the pointer, return those
                pointerIntersections
                : rectIntersection(args)
        let overId = getFirstCollision(intersections, 'id')

        if (overId == null) {
            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (recentlyMovedToNewContainer.current) {
                lastOverRef.current = activeId
            }

            // If no droppable is matched, return the last match
            return lastOverRef.current ? [{ id: lastOverRef.current }] : []
        }

        if (isContainer(overId)) {
            const containerItems = findContainerItemIds(overId)

            if (containerItems.length > 0) {
                overId = closestCenter({
                    ...args,
                    droppableContainers: args.droppableContainers.filter(
                        (container) =>
                            container.id !== overId &&
                            // TODO: eu genuinamente n tenho ideia de como isso aqui funciona
                            // talvez seja algo relacionado com reordenar as colunas
                            containerItems.includes(container.id as any)
                    ),
                })[0]?.id
            }
        }

        lastOverRef.current = overId

        return [{ id: overId }]
    }, [
        activeId,
        // FIXME: n sei se isso aqui tá certo
        gamePlayers
    ])

    function getTeamItems(teamResult: TeamResult): UniqueIdentifier[] {
        return gamePlayers.filter(gp => gp.team === teamResult).map(gp => gp.player_id)
    }

    function isContainer(id: UniqueIdentifier | null) {
        // TODO: this is a lil bit sucky maybe degrade the containerIds type
        return CONTAINER_IDS.includes(id as TeamResult)
    }

    function findPlayerTeam(id: UniqueIdentifier): TeamResult {
        const gamePlayer = gamePlayers.find(gp => gp.player_id === id)
        if (!gamePlayer) {
            throw 'unreachable (findPlayerTeam)'
        }

        return gamePlayer.team
    }

    // rename to be more semantic
    function findContainerItems(id: UniqueIdentifier) {
        return gamePlayers.filter(gp => gp.team === id)
    }
    function findContainerItemIds(id: UniqueIdentifier) {
        return findContainerItems(id).map(gp => gp.player_id)
    }

    function findContainer(id: UniqueIdentifier): UniqueIdentifier {
        return isContainer(id) ? id : findPlayerTeam(id)
    }

    function onDragCancel() {
        if (clonedGamePlayers) {
            setGamePlayers(clonedGamePlayers)
        }

        setActiveId(null)
        setClonedGamePlayers(null)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}

            onDragCancel={onDragCancel}

            onDragStart={({ active }) => {
                setActiveId(active.id)
                setClonedGamePlayers(gamePlayers)
            }}

            onDragEnd={({ active, over }) => {
                console.log('onDragEnd', { active, over })
                setActiveId(null)
            }}

            onDragOver={({ active, over }) => {
                let newGamePlayers = [...gamePlayers]

                if (isContainer(active.id) || !over) {
                    console.log('TODO:', 'onDragOver', { active, over })
                    return
                }

                const activeContainerId = findContainer(active.id)
                const overContainerId = findContainer(over.id)

                const activeIndex = newGamePlayers.findIndex(p => p.player_id === active.id)
                if (activeIndex === -1) {
                    console.error('unreachable (me thinks; active)', { activeId: active.id, over: over?.id, newGamePlayers });
                    return
                }

                if (activeContainerId !== overContainerId) {
                    newGamePlayers[activeIndex].team = overContainerId as TeamResult

                    if (isContainer(over.id)) {
                        setGamePlayers(newGamePlayers)
                        return
                    }
                }

                const overIndex = newGamePlayers.findIndex(p => p.player_id === over.id)
                if (overIndex === -1) {
                    console.error('unreachable (me thinks; over)', { activeId: active.id, over: over?.id, newGamePlayers })
                    return
                }

                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height

                const modifier = isBelowOverItem ? 1 : 0
                const newIndex = overIndex + modifier

                newGamePlayers = moveIndex(newGamePlayers, activeIndex, newIndex)

                setGamePlayers(newGamePlayers)
            }}
        >
            <SortableContext
                strategy={horizontalListSortingStrategy}
                items={['v', 'd']}
            >
                {/* <Flex
                    direction='row'
                    w='100%'
                    wrap='wrap'
                    gap='xs'
                    align='start'
                    justify='space-between' */}

                <div
                    style={{
                        display: 'flex',
                        // flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    {CONTAINER_IDS.map(teamResult => (
                        <SortableContext
                            key={teamResult}
                            strategy={verticalListSortingStrategy}
                            items={getTeamItems(teamResult)}
                        >
                            <TeamPreview
                                team={teamResult}
                                players={players.filter(p => (
                                    gamePlayers
                                        .find(gp => gp.player_id === p.id)?.team == teamResult
                                ))}
                                gamePlayers={gamePlayers.filter(gp => gp.team == teamResult)}
                            />
                        </SortableContext>
                    ))}
                    {createPortal(
                        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
                            {activeId
                                // TODO: this sucks slightly, maybe remove 'as const' from containerIds
                                ? CONTAINER_IDS.includes(activeId as TeamResult)
                                    ? null // renderContainerDragOverlay(activeId)
                                    : (
                                        <PlayerPreview
                                            data={{
                                                player: players.find(p => p.id === activeId)!,
                                                gamePlayer: gamePlayers
                                                    .find(gp => gp.player_id === activeId)!
                                            }}
                                            dragOverlay
                                        />
                                    )
                                : null}
                        </DragOverlay>,
                        document.body
                    )}
                </div>
            </SortableContext>
        </DndContext>
    )
}
