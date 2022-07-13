import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { RouteSlice, LoaderSlice } from 'store'
import { CSSTransition } from 'react-transition-group'
import { getCollection } from '@/lib/firestore'
import { toast } from 'lib/toast'
import { Scroller, ScrollerRefTypes } from 'components/scroller'


export default function Menu() {
    // Router
    const router = useRouter()

    // Store
    const dispatch = useDispatch()

    // Ref
    const scrollerRef = useRef<ScrollerRefTypes>()

    // State
    const [src, setSrc] = useState<Array<{ [key: string]: any }>>([])

    // Methods
    const routing = (href: string) => {
        const name = href.replace(/\//g, '')
        dispatch(RouteSlice.actions.set({ path: router.asPath, name }))
        window.setTimeout(() => router.push(href), 200)
    }

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

            scrollerRef.current?.enableScroll
                ? scrollerRef.current?.setScroller()
                : scrollerRef.current?.setEnableScroll(true)
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
                    <button type="button" className="menu-item" onClick={() => routing('/releasenote')}>
                        <span className="icon">
                            <img src="/img/menuicon-releasenote.png" alt="" />
                        </span>
                        <span className="text">
                            リリースノート
                        </span>
                    </button>

                    <button type="button" className="menu-item" onClick={() => routing('/option')}>
                        <span className="icon">
                            <img src="/img/menuicon-settings.png" alt="" />
                        </span>
                        <span className="text">
                            アプリ設定
                        </span>
                    </button>

                    <button type="button" className="menu-item" onClick={() => routing('/report')}>
                        <span className="icon">
                            <img src="/img/menuicon-feedback.png" alt="" />
                        </span>
                        <span className="text">
                            要望・不具合報告
                        </span>
                    </button>

                    <button type="button" className="menu-item" onClick={() => routing('/about')}>
                        <span className="icon">
                            <img src="/img/menuicon-manual.png" alt="" />
                        </span>
                        <span className="text">
                            アプリについて
                        </span>
                    </button>
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
