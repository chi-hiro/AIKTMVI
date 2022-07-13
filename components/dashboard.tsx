import { memo, useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { RouteSlice, LayoutTypes, DatabaseTypes, FilterSlice, PlayerTypes, ListTypes } from 'store'
import { reCreatorData, getDBData } from 'lib/aiktnaviUtl'
import { markupTitle } from 'lib/markupTitle'
import { Scroller, ScrollerRefTypes } from 'components/scroller'

const Dashboard = () => {
    // Router
    const router = useRouter()

    // Store
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const layout = useSelector((state: { layout: LayoutTypes }) => state.layout)
    const player = useSelector((state: { player: PlayerTypes }) => state.player)
    const playlist = useSelector((state: { playlist: ListTypes }) => state.playlist.data)

    // Ref
    const scrollerRef = useRef<ScrollerRefTypes>()

    // State
    const [src, setSrc] = useState<{ [key: string]: any }>()

    // Methods
    const setFiltering = (key: string, value: string) => {
        dispatch(FilterSlice.actions.setKeyword({ key, value }))

        if (router.asPath !== '/') {
            dispatch(RouteSlice.actions.set({ path: router.asPath, name: 'videolist' }))
            window.setTimeout(() => router.push('/'), 200)
        }
    }

    // Computed
    const creatorData = useMemo(() => {
        return reCreatorData(src)
    }, [src])

    // Hooks
    useEffect(() => {
        if (player.status === 'play') {
            scrollerRef.current?.setEnableScroll(false)
            setSrc(db.master.find(item => item.uid === playlist[player.bookmark]))
            process.nextTick(() => scrollerRef.current?.setEnableScroll(true))
        }
    }, [player.status, player.bookmark])

    // Render
    return (
        <CSSTransition classNames="dashboard" in={layout.sidebar && layout.env[0] === 'desktop'} timeout={0} unmountOnExit>
            <div id="dashboard" className={player.status !== 'stop' ? 'full' : ''}>
                <CSSTransition classNames="dashboard" in={player.status !== 'stop'} timeout={300} unmountOnExit>
                    <Scroller ref={scrollerRef} theme="primary" wrapperClass="dashboard-body">
                        <div className="dashboard-about-title">
                            <h5 className="title" dangerouslySetInnerHTML={markupTitle(src?.title)}></h5>
                        </div>

                        <div className="flex flex-wrap justify-start gap-1.5">
                            {creatorData.length ? (
                                creatorData.map((item, index) => (
                                    <div className="dashboard-about-item" key={`creator${index}`}>
                                        <h6 className="head">{item.label}</h6>
                                        <div className="body">
                                            <button type="button" className="name" onClick={() => setFiltering('creator', item.name)}><span>{item.name}</span></button>
                                        </div>
                                    </div>
                                ))
                            ) : ''}

                            {src?.vocal.length ? (
                                <div className="dashboard-about-item">
                                    <h6 className="head">歌唱アイドル</h6>
                                    <div className="body">
                                        {src.vocal.map((uid: string, index: number) => <button key={`idol${index}`} type="button" className="name" onClick={() => setFiltering('vocal', uid)}><span>{getDBData(db.vocal, uid, 'name')}</span></button>)}
                                    </div>
                                </div>
                            ) : ''}

                            {src?.chara.length ? (
                                <div className="dashboard-about-item">
                                    <h6 className="head">MV登場アイドル</h6>
                                    <div className="body">
                                        {src.chara.map((uid: string, index: number) => <button key={`chara${index}`} type="button" className="name" onClick={() => setFiltering('chara', uid)}><span>{getDBData(db.chara, uid, 'name')}</span></button>)}
                                    </div>
                                </div>
                            ) : ''}
                        </div>
                    </Scroller>
                </CSSTransition>
            </div>
        </CSSTransition>
    )
}

export default memo(Dashboard)