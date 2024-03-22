import { Image } from '@mantine/core'

export function ChampionIcon(props: { size: string, championName: string }) {
    return (
        <div style={{ width: props.size, height: props.size }}>
            <Image
                src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${props.championName}.png`}
            />
        </div>
    )
}
