import { useState, useEffect, useRef, createRef, RefObject } from 'react'
import { ReactSortable, ItemInterface, SortableEvent } from 'react-sortablejs'
import { arrayMoveImmutable } from 'array-move'
import { useDispatch, useSelector } from 'react-redux'
import { RouteTypes, PlayerTypes, PlayerSlice, ListTypes, PlaylistSlice } from 'store'
import Icon from 'components/icon'
import { Scroller, ScrollerRefTypes } from 'components/scroller'
import { Card, CardRefTypes } from 'components/card-playlist'
import { Modal, ModalRefTypes } from 'components/modal'
import { Help, HelpRefTypes } from 'components/help'

export default function Setlist() {
    // Store
    const dispatch = useDispatch()
    const route = useSelector((state: { route: RouteTypes}) => state.route)
    const player = useSelector((state: { player: PlayerTypes }) => state.player)
    const playlist = useSelector((state: { playlist: ListTypes }) => state.playlist.data)

    // Ref
    const scrollerRef = useRef<ScrollerRefTypes>()
    const clearModalRef = useRef<ModalRefTypes>()
    const helpRef = useRef<HelpRefTypes>()
    const child = useRef<RefObject<CardRefTypes>[]>([])

    // State
    const [clone, setClone] = useState<ItemInterface[]>([])
    const [isEdit, setEdit] = useState<boolean>(false)

    // Methods
    const sortItems = (e: SortableEvent) => {
        document.body.classList.remove('sortable-now')

        if (e.oldIndex !== undefined && e.newIndex !== undefined) {
            // プレイリストを更新
            const newList = arrayMoveImmutable([...playlist], e.oldIndex, e.newIndex)
            dispatch(PlaylistSlice.actions.set(newList))

            // activeの位置を再設定
            let newBookmark: number | undefined = undefined
            if (e.oldIndex < player.bookmark && e.newIndex >= player.bookmark) {
                newBookmark = player.bookmark - 1
            } else if (e.oldIndex > player.bookmark && e.newIndex <= player.bookmark) {
                newBookmark = player.bookmark + 1
            } else if (e.oldIndex === player.bookmark) {
                newBookmark = e.newIndex
            }
            if (newBookmark !== undefined) {
                dispatch(PlayerSlice.actions.bookmark(newBookmark))
            }
        }
    }

    const updateItems = () => {
        scrollerRef.current?.enableScroll && showItems('show', false)
    }

    const showItems = (mode: string, isDelay: boolean) => {
        const delay = isDelay ? 20 : 0
        playlist.forEach((_, index) => mode === 'show'
            ? window.setTimeout(() => child.current[index].current?.show(), delay * index)
            : child.current[index].current?.hide()
        )
    }

    const clearPlaylist = () => {
        dispatch(PlayerSlice.actions.end())
        dispatch(PlaylistSlice.actions.clear())
        clearModalRef.current?.hide()
    }

    const scrollActive = () => {
        const scroller = document.querySelector('.sidebar-body')!.querySelector('.custom-scroller-body')
        const active = document.querySelector('.card-playlist.active')

        if (scroller && active) {
            const top = scroller.scrollTop + active.getBoundingClientRect().top - (window.innerHeight - document.querySelector('#sidebar')!.clientHeight) - 52 - 10
            scroller.scrollTo({ top, behavior: 'smooth' })
        }
    }

    // Hooks
    if (playlist.length !== 0 && playlist.length !== child.current.length) {
        playlist.forEach((_, index) => child.current[index] = createRef())
    }

    useEffect(() => {
        scrollActive()
    }, [])

    useEffect(() => {
        if (child.current.length === playlist.length) {
            console.log('[Playlist]再構築したリストを画面に反映します', child.current.length)

            // 画面に反映 (show)
            showItems('show', true)
            scrollerRef.current?.enableScroll
                ? scrollerRef.current?.setScroller()
                : scrollerRef.current?.setEnableScroll(true)

            // ソート用クローンを構築
            const cloneList: ItemInterface[] = []
            playlist.map(item => cloneList.push({ id: item }))
            setClone(cloneList)
        }

        playlist.length === 0 && setEdit(false)
    }, [playlist, child])

    useEffect(() => {
        playlist.forEach((_, index) => child.current[index].current?.setEdit(isEdit))
    }, [isEdit])

    useEffect(() => {
        route.name !== 'setlist' && showItems('hide', false)
    }, [route])

    // Render
    return (
        <>
            <div id="sidebar-header-bar">
                <div className="flex justify-start gap-10px">
                    <button type="button" className={`btn-sidebar btn-icon-only ${playlist.length ? '' : 'disabled'}`} onClick={scrollActive}>
                        <span className="icon text-secondary"><Icon font="material" value="bookmark" /></span>
                    </button>

                    <button type="button" className={`btn-sidebar btn-edit ${isEdit ? 'active' : ''} ${playlist.length ? '' : 'disabled'}`} onClick={() => setEdit(!isEdit)}>
                        <span className="icon text-secondary"><Icon font="material" value={isEdit ? 'check' : 'edit'} /></span>
                        <span className="text">{isEdit ? 'かんりょう' : '編集モード'}</span>
                    </button>

                    <button type="button" className={`btn-sidebar btn-remove ${playlist.length ? '' : 'disabled'}`} onClick={(e) => clearModalRef.current?.show(e)}>
                        <span className="icon text-secondary"><Icon font="material" value="delete" /></span>
                        <span className="text">リストを空にする</span>
                    </button>
                </div>

                <button type="button" className={`btn-sidebar btn-help ${playlist.length ? '' : 'disabled'}`} onClick={() => helpRef.current?.show()}>
                    <span className="icon"><Icon font="custom" value="help" /></span>
                </button>
            </div>

            <Scroller ref={scrollerRef} btn={false} theme="secondary" wrapperClass="sidebar-body" scrollMethod={updateItems}>
                <ReactSortable
                    className={`cardlist cardlist-playlist ${player.status === 'play' ? 'now-playing' : ''}`}
                    list={clone}
                    setList={setClone}
                    forceFallback={true}
                    scrollSensitivity={140}
                    handle='.btn-sort'
                    onStart={() => document.body.classList.add('sortable-now')}
                    onEnd={(e) => sortItems(e)}
                >
                    {playlist.length === 0 ? (
                        <div className="card-nodata">
                            <span className="text-primary"><Icon font="material" value="info" /></span>
                            楽曲リストから<br />MVをセットリストに追加しよう！
                        </div>
                    ) : (
                        playlist.map((uid, index) =>
                            <Card key={`item${index}`} ref={child.current[index]} index={index} uid={uid as string} />
                        )
                    )}
                </ReactSortable>
            </Scroller>

            <Modal ref={clearModalRef}>
                <div className="modal-inner modal-clear">
                    <div className="modal-body p-1.5 text-center text-lg">
                        セットリストを空にするよ！
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn is-cancel" onClick={() => clearModalRef.current?.hide()}>
                            <span className="text">やめる</span>
                        </button>

                        <button type="button" className="btn is-primary" onClick={clearPlaylist}>
                            <span className="text">けってい</span>
                        </button>
                    </div>
                </div>
            </Modal>

            <Help ref={helpRef} uid="setlist" />
        </>
    )
}
