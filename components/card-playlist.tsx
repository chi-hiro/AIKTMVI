import { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseTypes, PlayerTypes, PlayerSlice, ListTypes, PlaylistSlice } from 'store'
import { CSSTransition } from 'react-transition-group'
import { typeClass } from 'lib/videoUtl'
import { markupTitle } from 'lib/markupTitle'
import Icon from 'components/icon'

export type CardRefTypes = {
    show: () => void,
    hide: () => void,
    setEdit: React.Dispatch<React.SetStateAction<boolean>>
}

type Props = {
    index: number,
    uid: string
}

export const Card = forwardRef((props: Props, ref) => {
    // Store
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const player = useSelector((state: { player: PlayerTypes }) => state.player)
    const playlist = useSelector((state: { playlist: ListTypes }) => state.playlist.data)

    // Ref
    const item = useRef<HTMLDivElement>(null)

    // State
    const [isShow, setShow] = useState<boolean>(false)
    const [isEdit, setEdit] = useState<boolean>(false)
    const [src, setSrc] = useState<{ [key: string]: any }>()

    // Methods
    const show = () => {
        const scrPos = document.querySelector('.custom-scroller-body')!.scrollTop
        const itemPos = scrPos + item.current!.getBoundingClientRect().top
        const startPos = itemPos - window.innerHeight - 80
        const endPos = itemPos + item.current!.offsetHeight + 80
        setShow(scrPos > startPos && scrPos < itemPos + endPos)
    }

    const hide = () => {
        setShow(false)
    }

    const remove = () => {
        // プレイリストを更新
        const newList = [...playlist]
        newList.splice(props.index, 1)
        dispatch(PlaylistSlice.actions.set(newList))

        // activeの位置を再設定
        if (props.index < player.bookmark) {
            dispatch(PlayerSlice.actions.bookmark(player.bookmark - 1))
        } else if (props.index === player.bookmark) {
            dispatch(PlayerSlice.actions.end())
        }
    }

    const play = () => {
        dispatch(PlayerSlice.actions.set({ status: 'play', bookmark: props.index }))
    }

    // Hooks
    useEffect(() => {
        db.master.length && setSrc(db.master.find(item => item.uid === props.uid))
    }, [db.master, playlist])

    // Binding
    useImperativeHandle(ref, () => ({
        show,
        hide,
        setEdit
    }))

    // Render
    return (
        <div ref={item} className={`card card-playlist ${typeClass(src?.type)} ${player.bookmark === props.index ? 'active' : ''} ${isEdit ? 'is-edit' : ''}`}>
            <CSSTransition classNames="card" in={isShow} timeout={100} unmountOnExit>
                <div className="inner">
                    <button type="button" className="btn-play" onClick={play}>
                        <span className="icon"><Icon font="custom" value="play" /></span>
                        <span className="card-title" dangerouslySetInnerHTML={markupTitle(src?.title)}></span>
                    </button>

                    <CSSTransition classNames="card-btn" in={isEdit} timeout={200} unmountOnExit>
                        <button type="button" className="btn-end btn-delete" onClick={remove}>
                            <span className="icon"><Icon font="material" value="close" /></span>
                        </button>
                    </CSSTransition>

                    <CSSTransition classNames="card-btn" in={!isEdit} timeout={200} unmountOnExit>
                        <button type="button" className="btn-end btn-sort">
                            <span className="icon"><Icon font="custom" value="handle" /></span>
                        </button>
                    </CSSTransition>

                    {player.bookmark === props.index ? <span className="card-seekbar"></span> : ''}
                </div>
            </CSSTransition>
        </div>
    )
})