import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SettingTypes, SettingSlice } from 'store'

type Props = {
    uid: string,
    title: string,
    desc?: string
}

const SettingItem = (props: Props) => {
    // Store
    const dispatch = useDispatch()
    const setting = useSelector((state: { setting: SettingTypes }) => state.setting)

    // Methods
    const toggleSetting = () => {
        dispatch(SettingSlice.actions.set({ key: props.uid, value: !setting[props.uid] }))
    }

    // Render
    return (
        <div className={`option-item option-item-${props.uid}`}>
            <span className="title">
                {props.title}
                {props.desc && <small className="description">{props.desc}</small>}
            </span>

            <button type="button" className={`btn btn-sm ${setting[props.uid] ? 'is-primary' : 'is-outline-default'}`} onClick={toggleSetting}>
                {setting[props.uid] ? 'する' : 'しない'}
            </button>
        </div>
    )
}

export default memo(SettingItem)