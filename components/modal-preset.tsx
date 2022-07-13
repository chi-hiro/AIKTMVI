import { memo, forwardRef, useRef, useState, useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseTypes, ListTypes, PlaylistSlice } from 'store'
import { toast } from 'lib/toast'
import { Modal, ModalRefTypes } from 'components/modal'

export type PresetModalRefTypes = {
    showModal: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const PresetModal = memo(forwardRef((_, ref) => {
    // Store
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const videolist = useSelector((state: { videolist: ListTypes }) => state.videolist.data)
    const playlist = useSelector((state: { playlist: ListTypes }) => state.playlist.data)

    // Ref
    const modalRef = useRef<ModalRefTypes>()

    // State
    const [order, setOrder] = useState<string>('random')
    const [number, setNumber] = useState<number | string>(15)

    // Variables
    const orderRadios = [
        { value: 'descend', label: '上から新しい順に' },
        { value: 'ascend', label: '下から登場順に' },
        { value: 'random', label: 'ランダムに' }
    ]

    const numberRadios = [
        { value: 4, label: '4曲' },
        { value: 10, label: '10曲' },
        { value: 15, label: '15曲 (約30分)' },
        { value: 30, label: '30曲 (約1時間)' },
        { value: 'all', label: '全曲' }
    ]

    // Methods
    const showModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        modalRef.current?.show(e)
    }
    const shuffle = (arr: string[]) => {
        for (let i = arr.length - 1; i >= 0; i--) {
            let random = Math.floor(Math.random() * (i + 1))
            let temp = arr[i]
            arr[i] = arr[random]
            arr[random] = temp
        }

        return arr
    }

    const addPlaylist = () => {
        let items: string[] = []
        videolist.map(item => {
            const src = db.master.find(master => master.uid === item)
            src && src.landscape && items.push(item)
        })

        switch (order) {
            case 'ascend':
                items = items.reverse()
                break
            case 'random':
                items = shuffle(items)
                break
        }

        const selectnum = (number === 'all') ? videolist.length : number as number
        if (items.length >= selectnum) items = items.slice(0, selectnum)
        const setData = [...playlist, ...items]

        // 上限に達している場合はエラー
        if (setData.length > 999) {
            toast('danger', 'セットリストに追加できるのは999曲までだよ！')
            return false
        }

        // プレイリストを更新
        dispatch(PlaylistSlice.actions.set(setData))

        // UI表示
        modalRef.current?.hide()
        const bottomnav = document.querySelector('#navigation .setlist')
        bottomnav?.classList.add('animate')

        process.nextTick(() => {
            window.setTimeout(() => {
                bottomnav?.classList.remove('animate')
            }, 300)
        })
    }

    // Binding
    useImperativeHandle(ref, () => ({
        showModal
    }))

    // Render
    return (
        <Modal ref={modalRef}>
            <div className="modal-inner modal-preset">
                <div className="modal-header">
                    <h5 className="title">まとめて選ぶ</h5>
                </div>

                <div className="modal-body p-1.5">
                    <section className="modal-section">
                        <h6 className="modal-section-heading">
                            <span className="text">順番</span>
                        </h6>

                        <div className="grid gap-10px">
                            {orderRadios.map(item => (
                                <div className="form-control-checkbox is-primary" key={`order_${item.value}`}>
                                    <input
                                        type="radio"
                                        name="order"
                                        id={`order_${item.value}`}
                                        value={item.value}
                                        checked={order === item.value}
                                        onChange={() => setOrder(item.value)}
                                    />
                                    <label htmlFor={`order_${item.value}`}>
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="modal-section">
                        <h6 className="modal-section-heading">
                            <span className="text">曲数</span>
                        </h6>

                        <div className="grid grid-cols-2 gap-10px">
                            {numberRadios.map(item => (
                                <div className="form-control-checkbox is-primary" key={`number_${item.value}`}>
                                    <input
                                        type="radio"
                                        name="number"
                                        id={`number_${item.value}`}
                                        value={item.value}
                                        checked={number === item.value}
                                        onChange={() => setNumber(item.value)}
                                    />
                                    <label htmlFor={`number_${item.value}`}>
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn is-cancel" onClick={() => modalRef.current?.hide()}>
                        <span className="text">やめる</span>
                    </button>

                    <button type="button" className="btn is-primary" onClick={addPlaylist}>
                        <span className="text">けってい</span>
                    </button>
                </div>
            </div>
        </Modal>
    )
}))