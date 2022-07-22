import { memo, useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { CSSTransition } from 'react-transition-group'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutSlice, DatabaseSlice, SettingTypes, SettingSlice, PlayerSlice, VideolistSlice, PlaylistSlice } from 'store'
import { getCollection } from '@/lib/firestore'
import { toast } from 'lib/toast'
import SettingItem from 'components/option-item'

type Props = {
    setLoad: () => void
}

const launcher = (props: Props) => {
    // Store
    const dispatch = useDispatch()
    const setting = useSelector((state: { setting: SettingTypes }) => state.setting)

    // State
    const [isShow, setShow] = useState<boolean>(true)
    const [isActive, setActive] = useState<string>('')
    const [phase, setPhase] = useState<number>(1)
    const [sequence, setSequence] = useState<number>(1)
    const [page, setPage] = useState<number>(1)
    const [tutorialFooter, setTutorialFooter] = useState<boolean>(true)
    const currentVer = process.env.NEXT_PUBLIC_VERSION!.replace(/\./g, '')

    // Mehods
    const verUp = () => {
        toast('success', 'アプリがアップデートされたよ！')
        sessionStorage.clear()
        localStorage.setItem('aiktmvi_version', currentVer)
        window.setTimeout(() => window.location.reload(), 2000)
        return false
    }

    const getStorage = (key: string) => {
        const res = localStorage.getItem('aiktmvi_' + key)

        switch (key) {
            case 'sidebar':
                res && dispatch(LayoutSlice.actions.set({ key: 'sidebar', value: res === 'true' ? true : false }))
                break

            case 'setting':
                res && dispatch(SettingSlice.actions.load(JSON.parse(res)))
                break

            case 'bookmark':
                res && dispatch(PlayerSlice.actions.bookmark(Number(res)))
                break

            case 'playlist':
                res && dispatch(PlaylistSlice.actions.set(JSON.parse(res)))
                break
        }
    }

    const getDatabase = async (db: string) => {
        const res = await getCollection(db)

        // DBが更新されている場合はセッションストレージをクリアする
        if (db === 'notification') {
            const timestamp = localStorage.getItem('aiktmvi_timestamp')
            if (timestamp && Number(new Date(res[0].date)) > Number(timestamp)) sessionStorage.clear()
        }

        switch (db) {
            case 'video':
                dispatch(DatabaseSlice.actions.set({ key: 'master', value: res }))
                const initialList: string[] = []
                res.map((item: { [key: string]: any }) => initialList.push(item.uid))
                dispatch(VideolistSlice.actions.set(initialList))
                break

            default:
                dispatch(DatabaseSlice.actions.set({ key: db, value: res }))
                break
        }
    }

    const loadData = async () => {
        // localStorageにアクセス
        getStorage('setting')
        getStorage('playlist')
        getStorage('bookmark')
        getStorage('sidebar')

        // Firebaseにアクセス
        await getDatabase('notification')
        await getDatabase('video')
        await getDatabase('vocal')
        await getDatabase('chara')

        // フェーズを進める
        setSequence(2)
        setPhase(2)

    }

    const appStart = () => {
        // 初回でセーブしないを選択して2回目以降の起動の場合
        const localSetting = localStorage.getItem('aiktmvi_setting')
        !localSetting && dispatch(SettingSlice.actions.set({ key: 'localsave', value: false }))

        props.setLoad()
        setActive('')
        window.setTimeout(() => setShow(false), 800)
    }

    const nextTutorial = () => {
        if (page < 4) {
            setTutorialFooter(false)
            window.setTimeout(() => {
                setPage(page + 1)
                setTutorialFooter(true)
            }, 300)
        } else {
            localStorage.setItem('aiktmvi_version', currentVer)
            dispatch(SettingSlice.actions.set({ key: 'localsave', value: setting.localsave }))
            appStart()
        }
    }

    // Computed
    const sequenceMessage = useMemo(() => {
        switch (sequence) {
            case 1:
                return 'つうしん中'
            case 2:
                return 'じゅんびOK'
            case 0:
                return 'つうしんに失敗しました'
            default:
                return ''
        }
    }, [sequence])

    const tutorialMessage = useMemo(() => {
        switch (page) {
            case 1:
                return 'AIKT.MV∞!とは'
            case 2:
                return 'つかいかた'
            case 3:
                return 'アプリを追加する'
            case 4:
                return 'かくにん'
        }
    }, [page])

    // Hooks
    useEffect(() => {
        setActive('connect')

        const localVer = localStorage.getItem('aiktmvi_version')
        localVer && Number(currentVer) > Number(localVer)
            ? verUp()
            : window.setTimeout(() => loadData(), 800)
    }, [])

    useEffect(() => {
        switch (phase) {
            case 2:
                window.setTimeout(() => setPhase(3), 1700)
                break
            case 3:
                window.setTimeout(() => {
                    localStorage.getItem('aiktmvi_version')
                        ? appStart()
                        : setActive('tutorial')
                }, 1000)
                break
        }
    }, [phase])

    // Render
    return (
        <CSSTransition classNames="launcher" in={isShow} timeout={200} unmountOnExit>
            <div id="launcher">
                <CSSTransition classNames="launcher-inner" in={isActive === 'connect'} timeout={800} unmountOnExit>
                    <div id="launcher-connect" className="launcher-inner">
                        <div id="launcher-connect-sequence" className={`phase${phase}`}>
                            <div id="launcher-connect-chara">
                                <span className="chara chara1 aine"></span>
                                <span className="chara chara2 mio"></span>
                            </div>

                            <span className="stage stage1"></span>
                            <span className="stage stage2"></span>
                            <img src="/img/launcher-stage-layer1.png" alt="" className="stage-bg-top" />
                            <img src="/img/launcher-stage-layer2.png" alt="" className="stage-bg-bottom" />
                        </div>

                        <div id="launcher-connect-message">
                            {sequence === 1 &&
                                <svg className="loader loader-spin" viewBox="0 0 50 50">
                                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                </svg>
                            }
                            {sequenceMessage}
                        </div>
                    </div>
                </CSSTransition>

                <CSSTransition classNames="launcher-inner" in={isActive === 'tutorial'} timeout={800} unmountOnExit>
                    <div id="launcher-tutorial" className="launcher-inner">
                        <div id="launcher-tutorial-page">
                            <CSSTransition classNames="tutorial-page" in={page === 1} timeout={300} unmountOnExit>
                                <div className="inner text-center">
                                    <p>「AIKT.MV∞!」は<br />アイカツ！シリーズのミュージックビデオを<br />無限に見たい人のために作られた<br />非公式のウェブアプリです。</p>
                                    <p>公式YouTubeチャンネルで配信されている<br />動画のみをまとめて連続視聴に特化した<br />スペシャルにおいしいアプリです。</p>
                                </div>
                            </CSSTransition>

                            <CSSTransition classNames="tutorial-page" in={page === 2} timeout={300} unmountOnExit>
                                <div className="inner text-center">
                                    <Image src="/img/howto-use.jpg" width={400} height={150} />
                                    <p className="mb-0">楽曲リストから見たい動画をえらんでね！<br />ボタンを押すと再生がはじまるよ！</p>
                                    <small>消音モードでも音が出るから注意してね</small>
                                </div>
                            </CSSTransition>

                            <CSSTransition classNames="tutorial-page" in={page === 3} timeout={300} unmountOnExit>
                                <div className="inner text-center">
                                    <p>ブラウザからホーム画面に追加すれば<br />アプリみたいに使えるよ！</p>
                                    <div className="tutorial-slide">
                                        <Image src="/img/howto-pwa-ios.jpg" width={400} height={250} />
                                        <Image src="/img/howto-pwa-android.jpg" width={400} height={250} />
                                    </div>
                                </div>
                            </CSSTransition>

                            <CSSTransition classNames="tutorial-page" in={page === 4} timeout={300} unmountOnExit>
                                <div className="inner">
                                    <p className="mb-0.5">「AIKT.MV∞!」はアプリ設定、ビデオ音量、プレイリスト内容をブラウザに保存します。</p>
                                    <p><small className="block text-muted">保存する設定での使用を推奨しています。<br />オフにしても、バージョン管理のため一部データは保存されます。</small></p>

                                    <div className="border p-1 mt-1.5 rounded">
                                        <SettingItem
                                            uid="localsave"
                                            title="ブラウザにデータを保存"
                                            desc="設定からいつでも変更できます"
                                        />
                                    </div>
                                </div>
                            </CSSTransition>
                        </div>

                        <CSSTransition classNames="tutorial-footer" in={tutorialFooter} timeout={300}>
                            <div id="launcher-tutorial-footer">
                                <span className="chara">
                                    <Image src="/img/howto-yurichan.png" width={84} height={117} />
                                </span>

                                <div className="message">
                                    <span>{tutorialMessage}</span>
                                </div>

                                <div className="dots">
                                    <span className={page === 1 ? 'active':''}></span>
                                    <span className={page === 2 ? 'active':''}></span>
                                    <span className={page === 3 ? 'active':''}></span>
                                    <span className={page === 4 ? 'active':''}></span>
                                </div>
                            </div>
                        </CSSTransition>

                        <button type="button" id="launcher-tutorial-btn" className="btn btn-lg btn-long is-primary" onClick={nextTutorial}>
                            {page < 4 ? 'つぎへ' : 'はじめる'}
                        </button>
                    </div>
                </CSSTransition>
            </div>
        </CSSTransition>
    )
}

export default memo(launcher)