import { memo, useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { CSSTransition } from 'react-transition-group'
import { useDispatch, useSelector } from 'react-redux'
import { RouteTypes, RouteSlice, LayoutTypes, LayoutSlice } from 'store'
import { getTouchPosition } from 'lib/getTouchPosition'

type Props = {
    children: React.ReactNode
}

const Sidebar = (props: Props) => {
    // Router
    const router = useRouter()

    // Store
    const dispatch = useDispatch()
    const route = useSelector((state: { route: RouteTypes}) => state.route)
    const layout = useSelector((state: { layout: LayoutTypes }) => state.layout)

    // Ref
    const sidebarRef = useRef<HTMLDivElement>(null)

    // State
    const [isShow, setShow] = useState<boolean>(true)
    const [isDrag, setDrag] = useState<boolean>(false)
    const [startPos, setStartPos] = useState<number>(0)
    const [endPos, setEndPos] = useState<number>(0)
    const [translate, setTranslate] = useState<{ [key: string]: string }>({})

    // Methods
    const routing = () => {
        dispatch(RouteSlice.actions.set({
            path: router.asPath,
            name: router.asPath === '/' ? 'videolist' : router.asPath.replace(/\//g, '')
        }))
    }

    const hide = () => {
        dispatch(LayoutSlice.actions.set({ key: 'sidebar', value: false }))
        window.setTimeout(() => setTranslate({}), 300)
    }

    const handleDown = (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
        setDrag(true)
        setStartPos(getTouchPosition(e, 'X') - (e.target as HTMLElement).offsetLeft)
    }

    const handleMove = (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (isDrag) {
            let pos = getTouchPosition(e, 'X') - startPos - (e.target as HTMLElement).offsetLeft
            if (pos < 0) pos = 0
            setEndPos(pos)
            setTranslate({ transform: `translateX(${pos}px) translateZ(0)` })
        }
    }

    const handleUp = () => {
        if (isDrag && sidebarRef.current) {
            setDrag(false)

            if (endPos > 40) {
                setTranslate({ transform: `translateX(${sidebarRef.current.clientWidth}px) translateZ(0)` })
                hide()
            } else {
                setTranslate({})
            }
        }
    }

    // Hooks
    useEffect(() => {
        route.path === 'dummypath' && routing()
        setShow(layout.sidebar)
    }, [])

    useEffect(() => {
        setShow(layout.sidebar)

        if (layout.sidebar) {
            document.querySelector('main')?.classList.remove('fullscreen')
        } else {
            document.querySelector('main')?.classList.add('fullscreen')
        }
    }, [layout.sidebar])

    useEffect(() => {
        route.path !== router.asPath && routing()
    }, [router.asPath])

    const isActive = useMemo(() => {
        const name = route.path === '/' ? 'videolist' : route.path.replace(/\//g, '')
        return route.name === name
    }, [route])

    return (
        <CSSTransition classNames="sidebar" in={isShow || (layout.env[0] === 'mobile' && layout.env[1] === 'portrait')} timeout={300}>
            <div id="sidebar" className={`${route.name} ${isDrag ? 'drag' : ''}`} ref={sidebarRef} style={translate}>
                <button
                    type="button"
                    id="sidebar-handle"
                    onTouchStart={handleDown}
                    onTouchMove={handleMove}
                    onTouchEnd={handleUp}
                    onTouchCancel={handleUp}
                    onMouseDown={hide}
                ></button>

                <CSSTransition classNames="page" in={isActive} timeout={200}>
                    <div id="sidebar-inner">
                        { props.children }
                    </div>
                </CSSTransition>
            </div>
        </CSSTransition>
    )
}

export default memo(Sidebar)