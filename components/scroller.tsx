import { forwardRef, useRef, useState, useEffect, useImperativeHandle } from 'react'
import { CSSTransition } from 'react-transition-group'
import Icon from 'components/icon'

export type ScrollerRefTypes = {
    setScroller: () => void,
    enableScroll: boolean,
    setEnableScroll: React.Dispatch<React.SetStateAction<boolean>>
}

type Props = {
    children: React.ReactNode,
    theme :string,
    btn?: boolean,
    wrapperClass?: string,
    scrollMethod?: () => void
}

export const Scroller = forwardRef((props: Props, ref) => {
    // Ref
    const scroller = useRef<HTMLDivElement>(null)

    // State
    const [bar, setBar] = useState<Number[]>([0, 0])
    const [isHide, setHide] = useState<boolean>(true)
    const [enableScroll, setEnableScroll] = useState<boolean>(false)
    const [isTransition, setIsTransition] = useState<boolean>(false)
    const [showBtn, setBtn] = useState<boolean[]>([false, true])

    // Methods
    const onScroll = () => {
        !isHide && props.scrollMethod && props.scrollMethod()
        setScroller()
    }

    const setScroller = () => {
        // Refがない場合は出直す
        if (!scroller.current) {
            window.setTimeout(() => setScroller(), 300)
            return false
        }

        // 処理を開始
        const body = scroller.current.querySelector('.custom-scroller-body') as HTMLElement

        if (enableScroll) {
            // iOSスクロール挙動対策
            if ('ontouchstart' in window) {
                if (body.scrollTop === 0) {
                    body.scrollTop = 1
                } else if (body.scrollTop + body.clientHeight === body.scrollHeight) {
                    body.scrollTop = body.scrollTop - 1
                }
            }

            // 高さを計算
            const wrapperH = (scroller.current.querySelector('.custom-scroller-line') as HTMLElement).offsetHeight
            const contentH = (body.children[0] as HTMLElement).offsetHeight

            if (contentH <= 80) {
                // コンテンツ内容が少なすぎる（まだ読み込めていない）場合は出直す
                window.setTimeout(() => setScroller(), 300)
            } else {
                // スクロールバーをセット
                let barH = Math.round(wrapperH * wrapperH / contentH)
                if (barH < 60) barH = 60

                if (barH > wrapperH) {
                    setHide(true)
                    setBtn([false, false])
                } else {
                    setHide(false)
                    setBtn([
                        body.scrollTop > 50,
                        body.scrollTop + body.clientHeight < body.scrollHeight - 50
                    ])
                }

                setBar([
                    barH,
                    Math.round(body.scrollTop * (wrapperH - barH) / (contentH - wrapperH))
                ])

                window.setTimeout(() => setIsTransition(false), 300)
            }
        } else {
            if (body.scrollTop !== 1) body.scrollTop = 1
        }
    }

    const scroll = (value: string) => {
        if (scroller.current) {
            const inner = scroller.current.querySelector('.custom-scroller-body')!

            switch (value) {
                case 'top':
                    inner.scrollTo({ top: 0, behavior: 'smooth' })
                    break

                case 'bottom':
                    inner.scrollTo({ top: inner.scrollHeight, behavior: 'smooth' })
                    break
            }
        }
    }

    // Hooks
    useEffect(() => {
        setIsTransition(true)
        setScroller()
    }, [enableScroll])

    // Binding
    useImperativeHandle(ref, () => ({
        setScroller,
        enableScroll,
        setEnableScroll
    }))

    // Render
    return (
        <div className={`custom-scroller ${props.wrapperClass ? props.wrapperClass : ''} ${isHide ? 'custom-scroller-hidden' : ''}`} ref={scroller}>
        <div className="custom-scroller-body" onScroll={onScroll}>
            <div className="inner">
                {props.children}
            </div>
        </div>

        <span className="custom-scroller-line">
            <span
                className={`custom-scroller-bar ${isTransition ? 'transition' : ''}`}
                style={{ height: `${bar[0]}px`, top: `${bar[1]}px` }}
            ></span>
        </span>

        <CSSTransition classNames="scroller-btn" in={props.btn && enableScroll && showBtn[0]} timeout={300} unmountOnExit>
            <button type="button" className={`btn btn-icon-only is-${props.theme} custom-scroller-btn up`} onClick={() => scroll('top')}>
                <span className="icon"><Icon font="custom" value="arrow-up" /></span>
            </button>
        </CSSTransition>

        <CSSTransition classNames="scroller-btn" in={props.btn && enableScroll && showBtn[1]} timeout={300} unmountOnExit>
            <button type="button" className={`btn btn-icon-only is-${props.theme} custom-scroller-btn down`} onClick={() => scroll('bottom')}>
                <span className="icon"><Icon font="custom" value="arrow-down" /></span>
            </button>
        </CSSTransition>
    </div>
    )
})