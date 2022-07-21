import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { RouteSlice, LoaderSlice } from 'store'
import { CSSTransition } from 'react-transition-group'
import { getCollection } from '@/lib/firestore'
import { toast } from 'lib/toast'
import { Scroller, ScrollerRefTypes } from 'components/scroller'

export default function Menu() {
    const dispatch = useDispatch()
    const scrollerRef = useRef<ScrollerRefTypes>()
    const [src, setSrc] = useState<Array<{ [key: string]: any }>>([])

    // Methods
    const updatenoteLabel = (category: string) => {
        switch (category) {
            case 'primary':
                return 'アプリアップデート'
            case 'secondary':
                return '楽曲追加'
            case 'tertiary':
                return '楽曲ナビ更新'
        }
    }

    // Hooks
    useEffect(() => {
        dispatch(LoaderSlice.actions.show())

        getCollection('notification')
            .then(response => setSrc(response))
            .catch(error => toast('danger', 'データを読み込めませんでした...'))
    }, [])

    useEffect(() => {
        if (src) {
            dispatch(LoaderSlice.actions.hide())
            scrollerRef.current?.init()
        }
    }, [src])

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

                <CSSTransition classNames="updatenote" in={src.length > 0} timeout={0} unmountOnExit>
                    <div className="updatenote">
                        <h2 className="updatenote-title">最近の更新</h2>

                        {src.map((item, index) => (
                            <div className="updatenote-item" key={`updatenote${index}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`label is-${item.category}`}>{updatenoteLabel(item.category)}</span>
                                    <span className="date">2022.4.27 14:29</span>
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

const MenuItem = (props: menuItemProps) => {
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
                <img src={`/img/menuicon-${props.icon}.png`} alt="" />
            </span>
            <span className="text">
                {props.label}
            </span>
        </button>
    )
}