import { useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { RouteSlice, SettingSlice } from 'store'
import { toast } from 'lib/toast'
import { Scroller, ScrollerRefTypes } from 'components/scroller'
import Icon from 'components/icon'
import SettingItem from 'components/option-item'
import { Modal, ModalRefTypes } from 'components/modal'

export default function Option() {
    // Router
    const router = useRouter()

    // Store
    const dispatch = useDispatch()

    // Ref
    const scrollerRef = useRef<ScrollerRefTypes>()
    const clearModalRef = useRef<ModalRefTypes>()
    const resetModalRef = useRef<ModalRefTypes>()

    // Methods
    const routing = (href: string) => {
        const name = href.replace(/\//g, '')
        dispatch(RouteSlice.actions.set({ path: router.asPath, name }))
        window.setTimeout(() => router.push(href), 200)
    }

    const clearOption = () => {
        localStorage.removeItem('aiktmvi_setting')
        dispatch(SettingSlice.actions.reset())
        clearModalRef.current?.hide()
        toast('success', '設定の初期化がかんりょうしたよ！')
    }

    const resetData = () => {
        localStorage.clear()
        sessionStorage.clear()
        resetModalRef.current?.hide()
        toast('success', 'データの削除がかんりょうしたよ！')
        window.setTimeout(() => window.location.reload(), 2000)
    }

    // Hooks
    useEffect(() => {
        scrollerRef.current?.init()
    }, [])

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
                        <span className="text">オプション</span>
                    </h1>
                </div>
            </div>

            <Scroller ref={scrollerRef} theme="tertiary" wrapperClass="sidebar-body sidebar-body-menu">
                <div className="p-10px">
                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">基本設定</span>
                        </h2>

                        <div className="inner">
                            <SettingItem
                                uid="portrait"
                                title="縦サイズのMVを再生"
                                desc="対応している楽曲を縦長画面のMVに切り替えるよ！"
                            />

                            <SettingItem
                                uid="shownovideo"
                                title="MVが配信されてない楽曲を表示"
                                desc="楽曲リストの表示を切り替えるよ！"
                            />

                            <SettingItem
                                uid="fullscreen"
                                title="画面拡大時にフルスクリーン化"
                                desc="スクリーン拡大時にブラウザをフルスクリーン化するよ！（PCのみ）"
                            />

                            <SettingItem
                                uid="localsave"
                                title="ブラウザにデータを保存"
                                desc="設定とセットリストの内容をブラウザに保存するよ！"
                            />
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">再生設定</span>
                        </h2>

                        <div className="inner">
                            <SettingItem
                                uid="autoplay"
                                title="楽曲を追加したら自動再生"
                                desc="楽曲をセットリストに追加したらすぐに再生をはじめるよ！"
                            />

                            <SettingItem
                                uid="autoremove"
                                title="再生が終わった楽曲を自動削除"
                                desc="再生が終わった曲をセットリストから自動で削除するよ！適用時はループ再生が使えなくなるよ！"
                            />

                            <SettingItem
                                uid="autovolume"
                                title="音が大きすぎる楽曲を自動調整"
                                desc="一部の音量が大きい楽曲を自動で調整するよ！（PCのみ）"
                            />

                            <SettingItem
                                uid="a060skip"
                                title="「ハローハロー」の冒頭シーンをスキップ"
                                desc="冒頭のビーチバレーシーンをスキップするよ！"
                            />

                            <SettingItem
                                uid="s033skip"
                                title="「ネバギバ☆」の冒頭シーンをスキップ"
                                desc="冒頭の登場シーンをスキップするよ！"
                            />

                            <SettingItem
                                uid="p016skip"
                                title="「星空のフロア」の冒頭シーンをスキップ"
                                desc="冒頭の会話シーンをスキップするよ！"
                            />
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">セーブデータの削除</span>
                        </h2>

                        <div className="inner">
                            <div className="option-item">
                                <span className="title">
                                    ブラウザに保存されているアプリのデータを削除するよ！
                                    <small className="description">ボタンを押すと確認画面に進みます。</small>
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-10px mt-1">
                                <button type="button" className="btn btn-sm btn-block is-danger" onClick={(e) => clearModalRef.current?.show(e)}>設定の初期化</button>
                                <button type="button" className="btn btn-sm btn-block is-danger" onClick={(e) => resetModalRef.current?.show(e)}>すべて削除</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Scroller>

            <Modal ref={clearModalRef}>
                <div className="modal-inner modal-clear">
                    <div className="modal-body p-1.5 text-center text-lg gap-0">
                        <span className="icon caution"><Icon font="material" value="warning" /></span>
                        設定を初期化するよ！
                        <small className="block">（他のデータは維持されます）</small>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn is-cancel" onClick={() => clearModalRef.current?.hide()}>
                            <span className="text">やめる</span>
                        </button>

                        <button type="button" className="btn is-primary" onClick={clearOption}>
                            <span className="text">けってい</span>
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal ref={resetModalRef}>
                <div className="modal-inner modal-clear">
                    <div className="modal-body p-1.5 text-center text-lg gap-0">
                        <span className="icon caution"><Icon font="material" value="warning" /></span>
                        セーブデータを削除するよ！
                        <small className="block">（セットリスト / 音量 / 設定がリセットされます）</small>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn is-cancel" onClick={() => resetModalRef.current?.hide()}>
                            <span className="text">やめる</span>
                        </button>

                        <button type="button" className="btn is-primary" onClick={resetData}>
                            <span className="text">けってい</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
