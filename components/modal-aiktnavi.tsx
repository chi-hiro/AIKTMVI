import { memo, forwardRef, useRef, useState, useMemo, useEffect, useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseTypes, FilterSlice, LoaderSlice } from 'store'
import Icon from 'components/icon'
import { Modal, ModalRefTypes } from 'components/modal'
import { getCollection } from '@/lib/firestore'
import { toast } from 'lib/toast'
import { seriesTitle, typeClass } from 'lib/videoUtl'
import { reCreatorData, getDBData } from 'lib/aiktnaviUtl'
import { markupTitle } from 'lib/markupTitle'
import { Scroller, ScrollerRefTypes } from 'components/scroller'
import Expansion from 'components/expansion'

export type NaviModalRefTypes = {
    showModal: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, uid: string) => void
}

export const NaviModal = memo(forwardRef((_, ref) => {
    // Store
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)

    // Ref
    const modalRef = useRef<ModalRefTypes>()
    const scrollerRef = useRef<ScrollerRefTypes>()

    // State
    const [src, setSrc] = useState<{ [key: string]: any }>()
    const [anime, setAnime] = useState<Array<{ [key: string]: any }>>([])
    const [cdinfo, setCdinfo] = useState<Array<{ [key: string]: any }>>([])

    // Methods
    const showModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, uid: string) => {
        dispatch(LoaderSlice.actions.hide())
        anime.length === 0 && getCollection('anime')
            .then(response => setAnime(response))
            .catch(error => toast('danger', 'animeデータを読み込めませんでした...'))

        dispatch(LoaderSlice.actions.hide())
        cdinfo.length === 0 && getCollection('cdinfo')
            .then(response => setCdinfo(response))
            .catch(error => toast('danger', 'cdinfoデータを読み込めませんでした...'))

        setSrc(db.master.find(item => uid === item.uid && item))
        modalRef.current?.show(e)
        window.setTimeout(() => scrollerRef.current?.setEnableScroll(true), 300)
    }

    const setFiltering = (key: string, value: string) => {
        dispatch(FilterSlice.actions.setKeyword({ key, value }))
        modalRef.current?.hide()
    }

    // Computed
    const creatorData = useMemo(() => {
        return reCreatorData(src)
    }, [src])

    // Hooks
    useEffect(() => {
        if (anime.length > 0 && cdinfo.length > 0) {
            dispatch(LoaderSlice.actions.hide())
        }
    }, [anime, cdinfo])

    // Binding
    useImperativeHandle(ref, () => ({
        showModal
    }))

    // Render
    return (
        <Modal ref={modalRef}>
            {src && (
                <div className="modal-inner modal-aiktnavi">
                    <div className={`aiktnavi-header ${typeClass(src.type)} ${!src.landscape && !src.portrait ? 'novideo' : ''}`}>
                        <div className="inner">
                            <h5 className="title" dangerouslySetInnerHTML={markupTitle(src.title)}></h5>
                            <small className="description">
                                <Icon font="material" value="sell" />
                                {seriesTitle(src.series)}
                            </small>
                        </div>
                        <div className="embed embed-3by1">
                            <img src={`//i.ytimg.com/vi/${src.landscape}/mqdefault.jpg`} alt="" />
                        </div>
                        <div id="aiktnavi-disc">
                            <span><img src={`//i.ytimg.com/vi/${src.landscape}/mqdefault.jpg`} alt="" /></span>
                        </div>
                    </div>

                    <Scroller ref={scrollerRef} theme="primary" wrapperClass="modal-body">
                        <div className="grid gap-1">
                            {creatorData.length && (
                                <section className="modal-section">
                                    <h6 className="modal-section-heading">
                                        <span className="text">曲を作った人</span>
                                    </h6>

                                    <div className="grid gap-0.25">
                                        {creatorData.map((item, index) => (
                                            <button type="button" className="btn is-default text-primary" key={`creator${index}`} onClick={() => setFiltering('creator', item.name)}>
                                                <div className="body">
                                                    <span className="label">{item.label}</span>
                                                    <span className="name">{item.name}</span>
                                                </div>
                                                <div className="icon">
                                                    <Icon font="custom" value="filtering" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {db.vocal.length && src.vocal.length ? (
                                <section className="modal-section">
                                    <h6 className="modal-section-heading">
                                        <span className="text">歌唱アイドル</span>
                                    </h6>

                                    <div className="grid gap-0.25">
                                        {src.vocal.map((uid: string, index: number) => (
                                            <button type="button" className="btn is-default text-primary" key={`vocal${index}`} onClick={() => setFiltering('vocal', uid)}>
                                                <div className="body">
                                                    <span className="name">{getDBData(db.vocal, uid, 'name')}</span>
                                                </div>
                                                <div className="icon">
                                                    <Icon font="custom" value="filtering" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ): ''}

                            {db.chara.length && src.chara.length ? (
                                <section className="modal-section">
                                    <h6 className="modal-section-heading">
                                        <span className="text">MV登場アイドル</span>
                                    </h6>

                                    <div className="grid gap-0.25">
                                        {src.chara.map((uid: string, index: number) => (
                                            <button type="button" className="btn is-default text-primary" key={`chara${index}`} onClick={() => setFiltering('chara', uid)}>
                                                <div className="body">
                                                    <span className="name">{getDBData(db.chara, uid, 'name')}</span>
                                                </div>
                                                <div className="icon">
                                                    <Icon font="custom" value="filtering" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ): ''}

                            {anime.length && src.anime.length ? (
                                <section className="modal-section">
                                    <h6 className="modal-section-heading">
                                        <span className="text">アニメ登場回</span>
                                    </h6>

                                    <div className="grid gap-0.25 anime">
                                        {src.anime.map((uid: string, index: number) => (
                                            <Expansion
                                                key={`anime${index}`}
                                                title={getDBData(anime, uid, 'title')}
                                                label={seriesTitle(getDBData(anime, uid, 'series'))}
                                                updateScroller={() => scrollerRef.current?.setScroller()}
                                            >
                                                <div className="grid gap-0.25 p-1">
                                                    {getDBData(anime, uid, 'banch') && (
                                                        <a href={getDBData(anime, uid, 'banch')} target="_blank" className="btn is-default text-secondary">
                                                            <div className="body">
                                                                <span className="name">バンダイチャンネルで見る</span>
                                                            </div>
                                                            <div className="icon">
                                                                <Icon font="custom" value="launch" />
                                                            </div>
                                                        </a>
                                                    )}

                                                    {getDBData(anime, uid, 'danime') && (
                                                        <a href={getDBData(anime, uid, 'danime')} target="_blank" className="btn is-default text-secondary">
                                                            <div className="body">
                                                                <span className="name">Dアニメストアで見る</span>
                                                            </div>
                                                            <div className="icon">
                                                                <Icon font="custom" value="launch" />
                                                            </div>
                                                        </a>
                                                    )}

                                                    {getDBData(anime, uid, 'hulu') && (
                                                        <a href={getDBData(anime, uid, 'hulu')} target="_blank" className="btn is-default text-secondary">
                                                            <div className="body">
                                                                <span className="name">Huluで見る</span>
                                                            </div>
                                                            <div className="icon">
                                                                <Icon font="custom" value="launch" />
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            </Expansion>
                                        ))}
                                    </div>
                                </section>
                            ): ''}

                            {cdinfo.length && src.cdinfo.length ? (
                                <section className="modal-section">
                                    <h6 className="modal-section-heading">
                                        <span className="text">収録されているCD</span>
                                    </h6>

                                    <div className="grid gap-0.25">
                                        {src.cdinfo.map((uid: string, index: number) => (
                                            <a href={`https://www.lantis.jp/release-item/${getDBData(cdinfo, uid, 'number')}.html`} target="_blank" className="btn is-default text-secondary" key={`cdinfo${index}`}>
                                                <div className="body">
                                                    <span className="name">{getDBData(cdinfo, uid, 'title')}</span>
                                                </div>

                                                <div className="icon">
                                                    <Icon font="custom" value="launch" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            ): ''}
                        </div>
                    </Scroller>

                    <div className="modal-footer">
                        <button type="button" className="btn is-primary" onClick={() => modalRef.current?.hide()}>
                        <span className="text">とじる</span>
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    )
}))