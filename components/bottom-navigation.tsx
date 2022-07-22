import { memo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { RouteTypes, RouteSlice, DatabaseTypes, ListTypes } from 'store'
import { CSSTransition } from 'react-transition-group'
import Icon from 'components/icon'

type Props = {
    callParentMethod?: (e: any) => void
}

const Button = memo((props: { icon: string, text: string}) => {
    return (
        <>
            <span className="icon">
                <Icon font="material" value={props.icon} />
            </span>

            <span className="text">
                {props.text}
            </span>
        </>
    )
})

const BottomNavigation = (props: Props) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const route = useSelector((state: { route: RouteTypes}) => state.route)
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const videolist = useSelector((state: { videolist: ListTypes }) => state.videolist.data)
    const playlist = useSelector((state: { playlist: ListTypes }) => state.playlist.data)

    const [showNotif, setShowNotif] = useState<boolean>(false)

    // Methods
    const routing = (href: string) => {
        const name = href === '/' ? 'videolist' : href.replace(/\//g, '')
        dispatch(RouteSlice.actions.set({ path: router.asPath, name }))
        window.setTimeout(() => router.push(href), 200)
        href === '/menu' && setShowNotif(false)
    }

    // Hooks
    useEffect(() => {
        const timestamp = localStorage.getItem('aiktmvi_timestamp')
        const lastupdate = Number(new Date(db.notification[0].date))
        if (timestamp && lastupdate > Number(timestamp)) {
            setShowNotif(true)
            localStorage.setItem('aiktmvi_timestamp', String(lastupdate))
        }
    }, [])

    // Render
    return (
        <div id="navigation">
            <div className={`navigation-item videolist ${route.name.match('videolist') ? 'active' : ''}`}>
                <button type="button" className="btn-navigation-parent" onClick={() => routing('/')}>
                    {<Button icon="music_video" text="楽曲リスト" />}

                    <CSSTransition classNames="navigation-badge" in={videolist.length > 0} timeout={300} unmountOnExit>
                        <span className="index-badge">{videolist.length}</span>
                    </CSSTransition>
                </button>

                {/*<CSSTransition classNames="navigation-child" in={route.name.match('videolist') !== null} timeout={300} unmountOnExit>*/}
                    <div className="navigation-child-group">
                        <button type="button" className="btn-navigation-child" onClick={(e) => props.callParentMethod && props.callParentMethod(e)}>
                            {<Button icon="playlist_add" text="まとめて選ぶ" />}
                        </button>
                    </div>
                {/*</CSSTransition>*/}
            </div>

            <div className={`navigation-item setlist ${route.name.match('setlist') ? 'active' : ''}`}>
                <button type="button" className="btn-navigation-parent" onClick={() => routing('/setlist')}>
                    {<Button icon="queue_music" text="セットリスト" />}

                    <CSSTransition classNames="navigation-badge" in={playlist.length > 0} timeout={300} unmountOnExit>
                        <span className="index-badge">{playlist.length}</span>
                    </CSSTransition>
                </button>
            </div>

            <div className={`navigation-item menu ${route.name.match(/menu/) ? 'active' : ''}`}>
                <button type="button" className="btn-navigation-parent" onClick={() => routing('/menu')}>
                    <Button icon="apps" text="メニュー" />
                    {showNotif && <span className="update-badge" />}
                </button>
            </div>
        </div>
    )
}

export default memo(BottomNavigation)