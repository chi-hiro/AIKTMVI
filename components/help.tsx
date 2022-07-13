import path from 'path'
import { memo, forwardRef, useState, useImperativeHandle } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useDispatch } from 'react-redux'
import { LoaderSlice } from 'store'
import { toast } from 'lib/toast'

type Props = {
    uid: string
}

export type HelpRefTypes = {
    show: () => void
}

export const Help = memo(forwardRef((props: Props, ref) => {
    // Store
    const dispatch = useDispatch()

    // State
    const [src, setSrc] = useState<Array<{ title: string, body: string }>>([])
    const [isShow, setShow] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)

    // Methods
    const load = async () => {
        const jsonPath = path.join(process.cwd(), 'help', `${props.uid}.json`)
        const res = await fetch(jsonPath)
        const data = await res.json()
        return data
    }

    const show = () => {
        dispatch(LoaderSlice.actions.show())

        load()
            .then(response => {
                setSrc(response)
                dispatch(LoaderSlice.actions.hide())
                setShow(true)
            })
            .catch(error => {
                dispatch(LoaderSlice.actions.hide())
                toast('danger', 'ヘルプデータを読み込めませんでした...')
            })
    }

    const hide = () => {
        setShow(false)
        window.setTimeout(() => setPage(1), 300)
    }

    const next = () => {
        page !== src.length
            ? setPage(page + 1)
            : hide()
    }

    // Binding
    useImperativeHandle(ref, () => ({
        show
    }))

    // Render
    return (
        <CSSTransition classNames="help" in={isShow} timeout={300} unmountOnExit>
            <div className={`help help-${props.uid}`} onClick={next}>
                {src.map((item, index) => (
                    <div className={`help-item help-item${index + 1} ${index + 1 === page ? 'active' : ''}`} key={`help${index}`}>
                        <span className="title">{item.title}</span>
                        <span className="body" dangerouslySetInnerHTML={{ __html: item.body }}></span>
                        <span className="tips">{page !== src.length ? 'つぎへ' : 'とじる'} ({page}/{src.length})</span>
                    </div>
                ))}
            </div>
        </CSSTransition>
    )
}))