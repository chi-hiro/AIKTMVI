import { memo, useRef, useMemo, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { RouteSlice, LoaderSlice, DatabaseTypes } from 'store'
import { CSSTransition } from 'react-transition-group'
import { Scroller, ScrollerRefTypes } from 'components/scroller'

const updateLabel: { [key: string]: string } = {
    primary: 'アプリアップデート',
    secondary: '楽曲追加',
    tertiary: '楽曲ナビ更新'
}

export default function Menu() {
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const scrollerRef = useRef<ScrollerRefTypes>()
    const [showNotif, setShowNotif] = useState<boolean>(false)

    // Recent update
    const filteringRecentItem = (category: string) => {
        return db.notification.filter(item => item.category === category && true)[0]
    }

    const recentUpdate = useMemo(() => {
        if (db.notification.length) {
            const newData: Array<{ [key: string]: string }> = []
            newData.push(filteringRecentItem('primary'))
            newData.push(filteringRecentItem('secondary'))
            newData.push(filteringRecentItem('tertiary'))
            newData.sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
            return newData
        }
    }, [db.notification])

    const updateDate = (value: string) => {
        const d = new Date(value)
        const day = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('.')
        const h = d.getHours()
        const m = d.getMinutes()
        const time = [h > 9 ? h : '0' + h, m > 9 ? m : '0' + m].join(':')
        return `${day} ${time}`
    }

    // Hooks
    useEffect(() => {
        dispatch(LoaderSlice.actions.show())
    }, [])

    useEffect(() => {
        if (db.notification.length) {
            dispatch(LoaderSlice.actions.hide())
            scrollerRef.current?.init()
            setShowNotif(true)
        }
    }, [db.notification])

    // Render
    return (
        <>
            <div id="sidebar-header">
                <h1 className="title">
                    <span className="text">メニュー</span>
                </h1>
            </div>

            <Scroller ref={scrollerRef} theme="tertiary" wrapperClass="sidebar-body sidebar-body-menu">
                <div className="grid grid-cols-3 gap-2 menu-container">
                    <MenuItem label="リリースノート" icon="releasenote" link="/releasenote" />
                    <MenuItem label="アプリ設定" icon="settings" link="/option" />
                    <MenuItem label="要望・不具合報告" icon="feedback" link="/report" />
                    <MenuItem label="アプリについて" icon="manual" link="/about" />
                </div>

                <CSSTransition classNames="updatenote" in={showNotif} timeout={0} unmountOnExit>
                    <div className="updatenote">
                        <h2 className="updatenote-title">最近の更新</h2>

                        {recentUpdate && recentUpdate.map((item, index) => (
                            <div className="updatenote-item" key={`updatenote${index}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`label is-${item.category}`}>{updateLabel[item.category]}</span>
                                    <span className="date">{updateDate(item.date)}</span>
                                </div>
                                <div className="body">{item.title}</div>
                            </div>
                        ))}
                    </div>
                </CSSTransition>
            </Scroller>
        </>
    )
}

type menuItemProps = {
    label: string,
    icon: string,
    link: string
}

const MenuItem = memo((props: menuItemProps) => {
    const router = useRouter()
    const dispatch = useDispatch()

    const routing = (href: string) => {
        const name = href.replace(/\//g, '')
        dispatch(RouteSlice.actions.set({ path: router.asPath, name }))
        window.setTimeout(() => router.push(href), 200)
    }

    return (
        <button type="button" className="menu-item" onClick={() => routing(props.link)}>
            <span className="icon">
                <Image src={`/img/menuicon-${props.icon}.png`} width={76} height={76} />
            </span>
            <span className="text">
                {props.label}
            </span>
        </button>
    )
})