import { forwardRef, useState, useMemo, useImperativeHandle } from 'react'
import { CSSTransition } from 'react-transition-group'

type Props = {
    children: React.ReactNode
}

export type ModalRefTypes = {
    show: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    hide: () => void
}

export const Modal = forwardRef((props: Props, ref) => {
    // State
    const [isShow, setShow] = useState<boolean>(false)
    const [pos, setPos] = useState<number[]>([0, 0])

    // Methods
    const show = (e: MouseEvent) => {
        e && setPos([
            Math.round(100 / window.innerWidth * e.clientX),
            Math.round(100 / window.innerHeight * e.clientY)
        ])

        process.nextTick(() => setShow(true))
    }

    const hide = () => {
        setShow(false)
    }

    // Hooks
    const positionStyle = useMemo((): {[key: string]: string} => {
        return { '--path': `${pos[0]}% ${pos[1]}%` }
    }, [pos])

    // Binding
    useImperativeHandle(ref, () => ({
        show,
        hide
    }))

    // Render
    return (
        <CSSTransition classNames="modal" in={isShow} timeout={400} unmountOnExit>
            <div className="modal">
                <div className="modal-mask" style={positionStyle}>
                    {props.children}
                </div>
            </div>
        </CSSTransition>
    )
})