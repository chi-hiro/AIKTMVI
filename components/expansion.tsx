import { useRef, useState, useEffect } from 'react'
import { Transition } from 'react-transition-group'

type Props = {
    title: string,
    label?: string,
    children: React.ReactNode
    updateScroller?: () => void
}

const Expansion = (props: Props) => {
    const body = useRef<HTMLDivElement>(null)
    const [isShow, setShow] = useState<boolean>(false)
    const [height, setHeight] = useState<number>(0)

    const beforeEnter = (e: Element) => setHeight(0)
    const enter = (e: Element) => setHeight(e.scrollHeight)
    const beforeExit = (e: Element) => setHeight(e.scrollHeight)
    const exit = (e: Element) => setHeight(0)

    useEffect(() => {
        window.setTimeout(() => props.updateScroller && props.updateScroller(), 300)
    }, [isShow])

    return (
        <div className={`expansion ${isShow ? 'active' : ''}`}>
            <button type="button" className="btn is-default text-primary expansion-toggler" onClick={() => setShow(!isShow)}>
                <div className="body">
                    <span className="title">{props.title}</span>
                    {props.label && <span className="label">{props.label}</span>}
                </div>
                <div className="icon">
                    <span className="font-icons chevron"></span>
                </div>
            </button>

            <Transition in={isShow} timeout={300} onEnter={beforeEnter} onEntering={enter} onExit={beforeExit} onExiting={exit} unmountOnExit>
                <div ref={body} className="expansion-body" style={{ height: height + 'px' }}>
                    {props.children}
                </div>
            </Transition>
        </div>
    )
}

export default Expansion