import { memo, forwardRef, useRef, useMemo, useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseTypes, FilterTypes, FilterSlice } from 'store'
import { seriesData } from 'lib/videoUtl'
import SettingItem from 'components/option-item'
import { Modal, ModalRefTypes } from 'components/modal'

export type FilteringModalRefTypes = {
    showModal: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const FilteringModal = memo(forwardRef((_, ref) => {
    // Store
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const filter = useSelector((state: { filter: FilterTypes }) => state.filter)

    // Ref
    const modalRef = useRef<ModalRefTypes>()

    // Methods
    const showModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        modalRef.current?.show(e)
    }

    const setFiltering = (value: string) => {
        const setData = [...filter.series]

        filter.series.includes(value)
            ? setData.splice(filter.series.indexOf(value), 1)
            : setData.push(value)

        setData.length !== 0
            ? dispatch(FilterSlice.actions.setSeries(setData))
            : resetFiltering()
    }

    const resetFiltering = () => {
        dispatch(FilterSlice.actions.reset())
    }

    const keywordLabel = useMemo(() => {
        switch (filter.keyword.key) {
            case 'creator':
                return filter.keyword.value
            case 'vocal':
                return db.vocal.find((item: { [key: string]: any }) => filter.keyword.value === item.uid)?.name
            case 'chara':
                return db.chara.find((item: { [key: string]: any }) => filter.keyword.value === item.uid)?.name
        }
    }, [filter.keyword])

    // Binding
    useImperativeHandle(ref, () => ({
        showModal
    }))

    // Render
    return (
        <Modal ref={modalRef}>
            <div className="modal-inner modal-filtering">
                <div className="modal-header">
                    <h5 className="title">楽曲の絞り込み</h5>

                    <button type="button" className="btn is-default" onClick={resetFiltering}>
                        <span className="text">デフォルトに戻す</span>
                    </button>
                </div>

                <div className="modal-body p-1.5">
                    <section className="modal-section">
                        <h6 className="modal-section-heading">
                            <span className="text">作品シリーズ</span>
                        </h6>

                        <div className="grid grid-cols-2 gap-0.25">
                            {seriesData.map((item, index) => (
                                <button
                                    type="button"
                                    key={`filter${index}`}
                                    className={`btn btn-sm btn-filtering-item ${filter.series.includes(item.uid) ? 'is-primary' : 'is-muted'}`}
                                    onClick={() => setFiltering(item.uid)}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="modal-section">
                        <h6 className="modal-section-heading">
                            <span className="text">人物名</span>
                        </h6>

                        {filter.keyword.value ? (
                            <p className="m-0 text-center">
                                「<span className="text-primary">{keywordLabel}</span>」で楽曲を絞り込んでるよ！
                            </p>
                        ) : (
                            <p className="m-0 text-center">
                                楽曲ナビから人物名で楽曲を絞り込めるよ！
                            </p>
                        )}
                    </section>

                    <SettingItem
                        uid="shownovideo"
                        title="MVが配信されてない楽曲を表示"
                    />
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn is-primary" onClick={() => modalRef.current?.hide()}>
                        <span className="text">とじる</span>
                    </button>
                </div>
            </div>
        </Modal>
    )
}))