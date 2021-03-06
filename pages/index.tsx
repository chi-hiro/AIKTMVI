import { useEffect, useState, useMemo, useRef, createRef, RefObject } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RouteTypes, DatabaseTypes, ListTypes, VideolistSlice, FilterTypes, FilterSlice, SettingTypes } from 'store'
import { seriesData, seriesArray, seriesTitle } from 'lib/videoUtl'
import Icon from 'components/icon'
import { Scroller, ScrollerRefTypes } from 'components/scroller'
import { Card, CardRefTypes } from 'components/card-videolist'
import { FilteringModal, FilteringModalRefTypes } from 'components/modal-filtering'
import { NaviModal, NaviModalRefTypes } from 'components/modal-aiktnavi'
import { Help, HelpRefTypes } from 'components/help'

export default function Home() {
    const dispatch = useDispatch()
    const route = useSelector((state: { route: RouteTypes}) => state.route)
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const videolist = useSelector((state: { videolist: ListTypes }) => state.videolist.data)
    const filter = useSelector((state: { filter: FilterTypes }) => state.filter)
    const setting = useSelector((state: { setting: SettingTypes }) => state.setting)

    const scrollerRef = useRef<ScrollerRefTypes>()
    const filteringModalRef = useRef<FilteringModalRefTypes>()
    const naviModalRef = useRef<NaviModalRefTypes>()
    const helpRef = useRef<HelpRefTypes>()
    const child = useRef<RefObject<CardRefTypes>[]>([])
    const [layout, setLayout] = useState<string>('list')

    // Methods
    const quickFiltering = (dir: string) => {
        let payload: string[] = []

        if (filter.series.length === seriesArray.length) {
            const nextIndex = dir === 'next' ? 0 : seriesArray.length - 1
            payload = [seriesArray[nextIndex]]
        } else if (filter.series.length === 1) {
            const nextIndex = seriesArray.indexOf(filter.series[0]) + (dir === 'next' ? 1 : -1)
            const nextData = seriesArray[nextIndex]
            payload = nextData ? [nextData] : seriesArray
        } else {
            payload = seriesArray
        }

        dispatch(FilterSlice.actions.setSeries(payload))
    }

    const resetFiltering = () => {
        dispatch(FilterSlice.actions.reset())
    }

    const showNavi = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, uid: string) => {
        naviModalRef.current?.showModal(e, uid)
    }

    const updateItems = () => {
        scrollerRef.current?.enableScroll && showItems('show', false)
    }

    const showItems = (mode: string, isDelay: boolean) => {
        if (child.current.length) {
            const delay = isDelay ? 20 : 0
            videolist.forEach((_, index) => mode === 'show'
                ? window.setTimeout(() => child.current[index].current?.show(), delay * index)
                : child.current[index].current?.hide()
            )
        }
    }

    const toggleLayout = () => {
        scrollerRef.current?.setEnableScroll(false)
        showItems('hide', false)

        // Transition????????????
        const value = layout === 'list' ? 'grid' : 'list'
        setting.localsave && localStorage.setItem('aiktmvi_card', value)
        window.setTimeout(() => setLayout(value), 100)
    }

    // Computed
    const filteringLabel = useMemo(() => {
        if (filter.keyword.value) {
            switch (filter.keyword.key) {
                case 'creator':
                    return filter.keyword.value
                case 'vocal':
                    return db.vocal.find((item: { [key: string]: any }) => filter.keyword.value === item.uid && item)?.name
                case 'chara':
                    return db.chara.find((item: { [key: string]: any }) => filter.keyword.value === item.uid && item)?.name
            }
        } else if (filter.series.length === seriesArray.length) {
            return '????????????????????????'
        } else if (filter.series.length === 1) {
            return seriesTitle(filter.series[0])
        } else {
            return '??????????????????'
        }
    }, [filter])

    const filteringCount = useMemo(() => {
        return filter.keyword.value
            ? filter.series.length + 1
            : filter.series.length !== seriesData.length ? filter.series.length : 0
    }, [filter])

    // Hooks
    if (videolist.length !== 0 && videolist.length !== child.current.length) {
        videolist.forEach((_, index) => child.current[index] = createRef())
    }

    useEffect(() => {
        const LS_DATA = localStorage.getItem('aiktmvi_card')
        LS_DATA && setLayout(LS_DATA)
    }, [])

    useEffect(() => {
        if (db.master.length) {
            console.log('[Videolist]????????????????????????????????????')
            // ??????????????? (hide)
            scrollerRef.current?.setEnableScroll(false)
            showItems('hide', false)

            // ?????????
            let newList: string[] = []

            db.master.map(item => {
                let addId: string | undefined = undefined

                if (!setting.shownovideo && !item.landscape && !item.portrait) {
                    addId = undefined
                } else if (filter.keyword.value) {
                    const keywordFilter: boolean = filter.keyword.key === 'creator'
                        ? Object.values(item).find(value => value === filter.keyword.value)
                        : item[filter.keyword.key].includes(filter.keyword.value)
                    if (filter.series.includes(item.series) && keywordFilter) addId = item.uid
                } else {
                    if (filter.series.length !== seriesArray.length) {
                        if (filter.series.includes(item.series)) addId = item.uid
                    } else {
                        addId = item.uid
                    }
                }

                addId && newList.push(addId)
            })

            // Transition????????????
            window.setTimeout(() => dispatch(VideolistSlice.actions.set(newList)), 100)
        }
    }, [filter, setting.shownovideo])

    useEffect(() => {
        if (child.current.length && videolist.length) {
            console.log('[Videolist]???????????????????????????????????????????????????', child.current.length)

            // ??????????????? (show)
            showItems('show', true)
            scrollerRef.current?.init()
        }
    }, [videolist, layout])

    useEffect(() => {
        route.name !== 'videolist' && showItems('hide', false)
    }, [route])

    // Render
    return (
        <>
            <div id="sidebar-header-bar">
                {filteringLabel === '??????????????????' || filter.keyword.value ? (
                    <div className="flex justify-between items-center flex-auto">
                        <button type="button" className="btn-sidebar btn-quickchange-reset" onClick={resetFiltering}>
                            <span className="icon text-primary"><Icon font="material" value="cancel" /></span>
                            <span className="text">{ filteringLabel }</span>
                        </button>
                    </div>
                ): (
                    <div className="flex justify-between items-center flex-auto">
                        <button type="button" className="btn-sidebar btn-quickchange-prev" onClick={() => quickFiltering('prev')}>
                            <span className="icon text-primary"><Icon font="custom" value="quick-prev" /></span>
                        </button>

                        <button type="button" className="btn-sidebar btn-quickchange-next" onClick={() => quickFiltering('next')}>
                            <span className="icon text-primary"><Icon font="custom" value="quick-next" /></span>
                            <span className="text">{ filteringLabel }</span>
                        </button>
                    </div>
                )}

                <button type="button" className="btn-sidebar btn-icon-only btn-filtering" onClick={(e) => filteringModalRef.current?.showModal(e)}>
                    <span className="icon text-primary"><Icon font="custom" value="filtering" /></span>
                    {filteringCount > 0 && <span className="index-badge is-primary">{ filteringCount }</span>}
                </button>

                <button type="button" className="btn-sidebar btn-icon-only btn-layout" onClick={toggleLayout}>
                    <span className="icon text-primary"><Icon font="material" value={layout === 'list' ? 'table_rows' : 'grid_view'} /></span>
                </button>

                <button type="button" className={`btn-sidebar btn-help ${videolist.length ? '' : 'disabled'}`} onClick={() => helpRef.current?.show()}>
                    <span className="icon"><Icon font="custom" value="help" /></span>
                </button>
            </div>

            <Scroller ref={scrollerRef} btn={true} theme="primary" wrapperClass="sidebar-body" scrollMethod={updateItems}>
                <div className={`cardlist cardlist-videolist ${layout === 'grid' ? 'grid-cols-2 gap-0.5' : ''}`}>
                    {videolist.length === 0 ? (
                        <div className="card-nodata">
                            ???????????????????????????????????????...<br />?????????????????????????????????????????????
                        </div>
                    ) : (
                        videolist.map((uid, index) =>
                            <Card key={`item${index}`} ref={child.current[index]} uid={uid} showNavi={showNavi} layout={layout} />
                        )
                    )}
                </div>
            </Scroller>

            <FilteringModal ref={filteringModalRef} />

            <NaviModal ref={naviModalRef} />

            <Help ref={helpRef} uid="videolist" />
        </>
    )
}
