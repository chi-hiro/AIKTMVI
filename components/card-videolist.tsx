import { useEffect, useState, forwardRef, useRef, useMemo, useImperativeHandle } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useDispatch, useSelector } from 'react-redux'
import { SettingTypes, DatabaseTypes, PlayerTypes, PlayerSlice, ListTypes, PlaylistSlice } from 'store'
import { toast } from 'lib/toast'
import { typeClass } from 'lib/videoUtl'
import { markupTitle } from 'lib/markupTitle'
import { getTouchPosition } from 'lib/getTouchPosition'
import Icon from 'components/icon'

export type CardRefTypes = {
    show: () => void,
    hide: () => void
}

type Props = {
    uid: string,
    layout: string,
    showNavi?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, uid: string) => void
}

export const Card = forwardRef((props: Props, ref) => {
    // Store
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const player = useSelector((state: { player: PlayerTypes }) => state.player)
    const videolist = useSelector((state: { videolist: ListTypes }) => state.videolist.data)
    const playlist = useSelector((state: { playlist: ListTypes }) => state.playlist.data)
    const setting = useSelector((state: { setting: SettingTypes }) => state.setting)

    // Ref
    const item = useRef<HTMLDivElement>(null)

    // State
    const [isShow, setShow] = useState<boolean>(false)
    const [isEffect, setEffect] = useState<boolean>(false)
    const [effectPos, setEffectPos] = useState<number[]>([0, 0])
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

    const showNavi = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (props.showNavi && props.uid) props.showNavi(e, props.uid)
    }

    const addPlaylist = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const setData = [...playlist, props.uid]

        // 上限に達している場合はエラー
        if (setData.length > 999) {
            toast('danger', 'セットリストに追加できるのは999曲までだよ！')
            return false
        }

        // プレイリストを更新
        dispatch(PlaylistSlice.actions.set(setData))

        // [オプション]自動で再生を始める
        if (setting.autoplay && player.status === 'stop') {
            const bookmark = setData.length - 1
            dispatch(PlayerSlice.actions.set({ status: 'play', bookmark }))
        }

        // エフェクト表示
        const posX = getTouchPosition(e as any, 'X') - e.currentTarget.getBoundingClientRect().left
        const posY = getTouchPosition(e as any, 'Y') - e.currentTarget.getBoundingClientRect().top
        const bottomnav = document.querySelector('#navigation .setlist')
        bottomnav?.classList.add('animate')
        setEffectPos([posX, posY])
        setEffect(true)

        process.nextTick(() => {
            window.setTimeout(() => {
                bottomnav?.classList.remove('animate')
                setEffect(false)
            }, 300)
        })
    }

    // Computed
    const icon = useMemo(() => {
        if (src) {
            if (setting.portrait) {
                if (src?.portrait) {
                    return 'portrait'
                } else {
                    return src.landscape ? 'landscape' : 'novideo'
                }
            } else {
                return src.landscape ? 'landscape' : 'novideo'
            }
        } else {
            return 'novideo'
        }
    }, [src, setting.portrait])

    // Hooks
    useEffect(() => {
        db.master.length && setSrc(db.master.find(item => item.uid === props.uid))
    }, [videolist])

    // Binding
    useImperativeHandle(ref, () => ({
        show,
        hide
    }))

    // Render
    return src ? (
        <div ref={item} className={`card card-videolist card-${props.layout} ${typeClass(src.type)} ${icon} ${isEffect ? 'effect' : ''}`}>
            <CSSTransition classNames="card" in={isShow} timeout={100} unmountOnExit>
                {props.layout !== 'grid' ? (
                    <div className="inner">
                        <button type="button" className="btn-play" onClick={addPlaylist}>
                            <span className="icon"><Icon font="custom" value={icon} /></span>
                            <span className="card-title" dangerouslySetInnerHTML={markupTitle(src.title)}></span>
                            <CSSTransition classNames="card-effect" in={isEffect} timeout={400} unmountOnExit>
                                <span className="effect" style={{ left: `${effectPos[0]}px`, top: `${effectPos[1]}px` }}></span>
                            </CSSTransition>
                        </button>

                        <button type="button" className="btn-end btn-navi" onClick={showNavi}>
                            <span className="icon"><Icon font="custom" value="navi" /></span>
                        </button>
                    </div>
                ) : (
                    <div className="inner">
                        <button type="button" className="btn-play" onClick={addPlaylist}>
                            <div className="overlay">
                                <span className="icon"><Icon font="custom" value={icon} /></span>
                            </div>
                            <div className={`embed embed-16by9 ${!src.landscape && !src.portrait ? 'novideo' : ''}`}>
                                {src.landscape && <img src={`//i.ytimg.com/vi/${src.landscape}/mqdefault.jpg`} alt="" />}
                            </div>
                            <CSSTransition classNames="card-effect" in={isEffect} timeout={400} unmountOnExit>
                                <span className="effect" style={{ left: `${effectPos[0]}px`, top: `${effectPos[1]}px` }}></span>
                            </CSSTransition>
                        </button>

                        <div className="card-body">
                            <span className="card-title" dangerouslySetInnerHTML={markupTitle(src.title)}></span>
                            <button type="button" className="btn-end btn-navi" onClick={showNavi}>
                                <span className="icon"><Icon font="custom" value="navi" /></span>
                            </button>
                        </div>
                    </div>
                )}
            </CSSTransition>
        </div>
    ) : (
        <span ref={item} className={`card card-videolist card-${props.layout}`} />
    )
})