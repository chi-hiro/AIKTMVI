import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { RouteSlice, LoaderSlice } from 'store'
import { CSSTransition } from 'react-transition-group'
import { getCollection } from '@/lib/firestore'
import { toast } from 'lib/toast'
import { Scroller, ScrollerRefTypes } from 'components/scroller'
import Icon from 'components/icon'

export default function ReleaseNote() {
    const router = useRouter()
    const dispatch = useDispatch()

    const scrollerRef = useRef<ScrollerRefTypes>()
    const [src, setSrc] = useState<Array<{ [key: string]: any }>>([])

    // Methods
    const routing = (href: string) => {
        const name = href.replace(/\//g, '')
        dispatch(RouteSlice.actions.set({ path: router.asPath, name }))
        window.setTimeout(() => router.push(href), 200)
    }

    // Hooks
    useEffect(() => {
        dispatch(LoaderSlice.actions.show())

        getCollection('releasenote')
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
                <div className="flex items-center">
                    <button type="button" className="btn-back" onClick={() => routing('/menu')}>
                        <span className="icon">
                            <Icon font="custom" value="arrow-up" />
                        </span>
                    </button>

                    <h1 className="title">
                        <span className="text">リリースノート</span>
                    </h1>
                </div>
            </div>

            <Scroller ref={scrollerRef} theme="tertiary" wrapperClass="sidebar-body sidebar-body-menu">
                <div className="p-10px">
                    <CSSTransition classNames="releasenote" in={src.length > 0} timeout={0} unmountOnExit>
                        <div className="releasenote-section">
                            {src.map((item, index) => (
                                <div className="releasenote-item" key={`releasenote${index}`}>
                                    <h2 className="head">{item.title}</h2>
                                    <div className="body" dangerouslySetInnerHTML={{ __html: item.body }}></div>
                                </div>
                            ))}
                        </div>
                    </CSSTransition>
                </div>
            </Scroller>
        </>
    )
}
