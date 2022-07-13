import { memo } from 'react'

type Props = {
    font: string,
    value: string
}

const Icon = (props: Props) => {
    return (
        props.font === 'material' ? (
            <span className={`material-icons-round`}>{props.value}</span>
        ) : (
            <span className={`font-icons ${props.value}`}></span>
        )
    )
}

export default memo(Icon)