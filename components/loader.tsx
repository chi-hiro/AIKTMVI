import { memo } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useSelector } from 'react-redux'
import { LoaderTypes } from 'store'

const Loader = () => {
    const loader = useSelector((state: { loader: LoaderTypes }) => state.loader)

    return (
        <CSSTransition classNames="loader" in={loader.status} timeout={100} unmountOnExit>
            <div id="loader">
                <div id="loader-inner">
                    <svg className="loader loader-spin" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                    <span className="text">つうしん中だよ！</span>
                </div>
            </div>
        </CSSTransition>
    )
}

export default memo(Loader)