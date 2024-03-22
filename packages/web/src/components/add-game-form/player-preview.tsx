import { useSortable } from "@dnd-kit/sortable"
import { Paper, Text } from "@mantine/core"
import classNames from "classnames"

import type { GamePlayer, Player } from "../../types"
import { ChampionIcon } from "./champion-icon"
import itemClasses from './item.module.css'



interface PlayerPreviewData {
    player: Player
    gamePlayer: GamePlayer
}

interface SortableItemProps {
    key?: string | number
    dragOverlay?: boolean
    disabled?: boolean
    height?: number
    index?: number
    fadeIn?: boolean
    style?: React.CSSProperties
    transition?: string | null
}

type PlayerPreviewProps = { data: PlayerPreviewData } & SortableItemProps


export const PlayerPreview = (props: PlayerPreviewProps) => {
    const { fadeIn, dragOverlay, transition } = props;
    const { player, gamePlayer } = props.data
    const { champion } = gamePlayer

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isSorting,
        isDragging
    } = useSortable({
        id: player.id,
        data: { type: 'player', player, gamePlayer }
    })

    // const style = {
    //     transform: CSS.Translate.toString(transform),
    // };


    return (
        <Paper
            ref={setNodeRef}
            style={{
                transition: [transition]
                    .filter(Boolean)
                    .join(", "),
                "--translate-x": transform
                    ? `${Math.round(transform.x)}px`
                    : undefined,
                "--translate-y": transform
                    ? `${Math.round(transform.y)}px`
                    : undefined,
                "--scale-x": transform?.scaleX
                    ? `${transform.scaleX}`
                    : undefined,
                "--scale-y": transform?.scaleY
                    ? `${transform.scaleY}`
                    : undefined,
                // TODO: not sure why this is needed
            } as React.CSSProperties}
            className={classNames(
                itemClasses.Item,
                // TODO: this one should be in the wrapper
                isDragging && itemClasses.dragging,
                fadeIn && itemClasses.fadeIn,
                isSorting && itemClasses.sorting,
                dragOverlay && itemClasses.dragOverlay
            )}
            withBorder
            {...listeners}
            {...attributes}
        >
            {
                champion && (
                    <ChampionIcon size='32px' championName={champion} />
                )
            }
            <Text size='sm'>
                {player.name}
            </Text>
        </Paper>
    )
}
