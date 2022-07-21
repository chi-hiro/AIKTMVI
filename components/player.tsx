import { memo, useState, useMemo, useEffect } from 'react'
import YouTube from 'react-youtube'
import Slider from 'rc-slider'
import { CSSTransition } from 'react-transition-group'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutTypes, LayoutSlice, SettingTypes, DatabaseTypes, PlayerTypes, PlayerSlice, ListTypes, PlaylistSlice } from 'store'
import { getDownVolume } from 'lib/autoVolume'
import { env } from 'lib/env'
import { toast } from 'lib/toast'
import Icon from 'components/icon'

let interval: number
let stateList: string[] = []
let statePlay: boolean = false
let stateIndex: number = 0

const Player = () => {
    // Store
    const dispatch = useDispatch()
    const db = useSelector((state: { database: DatabaseTypes }) => state.database)
    const layout = useSelector((state: { layout: LayoutTypes }) => state.layout)
    const player = useSelector((state: { player: PlayerTypes }) => state.player)
    const playlist = useSelector((state: { playlist: ListTypes }) => state.playlist.data)
    const setting = useSelector((state: { setting: SettingTypes }) => state.setting)

    // State
    const [youtube, setYoutube] = useState<any>()
    const [time, setTime] = useState<{ [key: string]: number }>({ current: 0, total: 0, top: 0 })
    const [volume, setVolume] = useState<number>(100)
    const [mute, setMute] = useState<boolean>(false)
    const [quality, setQuality] = useState<number>(1080)
    const [downVolume, setDownVolume] = useState<number>(0)
    const [eyecatch, setEyecatch] = useState<boolean>(false)
    const [overlay, setOverlay] = useState<boolean>(false)
    const [controller, setController] = useState<boolean>(true)
    const [isSeek, setSeek] = useState<boolean>(false)
    const [loop, setLoop] = useState<boolean>(false)

    // Methods
    const onReady = (event: any) => {
        setYoutube(event.target)
        console.log('[Player]プレイヤーの準備が整いました')
    }

    const onPlay = () => {
        const videoData = youtube.getVideoData()
        if (videoData.title === '') {
            toast('danger', 'このアイテムはYouTubeから削除されたようです...')
            dispatch(PlayerSlice.actions.end())
            return false
        }


        // 最初に -> 時間をセット
        let currentTime: number = time.current
        let totalTime: number = time.total
        if (totalTime === 0) totalTime = Math.floor(youtube.getDuration())

        // 最初に -> 画質をセット
        switch (youtube.getPlaybackQuality()) {
            case 'hd1080':
                setQuality(1080)
                break
            case 'hd720':
                setQuality(720)
                break
            case 'large':
                setQuality(480)
                break
            case 'medium':
                setQuality(360)
                break
            case 'small':
                setQuality(240)
                break
        }

        // 最初に -> 幕を開ける
        interval && window.clearInterval(interval)
        window.setTimeout(() => setEyecatch(false), 500)

        // 常に
        interval = window.setInterval(() => {
            // 現在時間の取得
            currentTime = Math.floor(youtube.getCurrentTime())
            setTime({ ...time, current: currentTime, total: totalTime })

            // プレイリストのシークバーを更新
            const cardSeekbar = document.querySelector('#sidebar .card-playlist.active .card-seekbar') as HTMLElement
            if (cardSeekbar) cardSeekbar.style.width = (currentTime - time.top) / (totalTime - time.top) * 100 + '%'

            // 終了2秒前 -> 幕を閉じる
            if (currentTime >= totalTime - 2 && interval) {
                window.clearInterval(interval)
                setEyecatch(true)

                // 終了 -> 次の曲へ
                window.setTimeout(() => setNext(), 1000)
            }

            console.log('interval:', interval, currentTime, totalTime, time.top)
        }, 1000)
    }

    const setVideo = (list: string[], index: number) => {
        // 楽曲データを取得
        const src = db.master.find(item => item.uid === list[index])
        let videoId: string = src?.landscape

        // タテヨコ判別
        if (setting.portrait && src?.portrait) videoId = src.portrait

        // 同じIDの動画が流れている場合はセットしない
        if (videoId === youtube.getVideoData().video_id) {
            return false
        }

        // 初期化
        interval && window.clearInterval(interval)
        let stateVolume: number = volume + downVolume
        if (setting.autovolume && downVolume) {
            if (stateVolume > 100) stateVolume = 100
            setVolume(stateVolume)
            setDownVolume(0)
        }

        if (src) {
            let startSeconds: number = Number(src.skipstart)
            let endSeconds: number = Number(src.skipend)

            // オプション: 楽曲固有の処理
            if (videoId === 'va8ZKyVUV5Y' && setting.p016skip === true) {
                startSeconds = 14
            }
            if (videoId === 'Jc6qt9koAVg' && setting.a060skip === true) {
                startSeconds = 10
            }
            if ((videoId === 'Cw9VvmBdGGI' || videoId === 'feOwu6zBwZg') && setting.s033skip === true) {
                startSeconds = 10
            }

            // 時間をセット
            setTime({ current: startSeconds, total: endSeconds, top: startSeconds })

            // オプション: 音量を自動で下げる
            const downVolume = getDownVolume(videoId)
            if (setting.autovolume && downVolume) {
                console.log('[Player]音量の自動調整を有効にします')
                let newVolume = stateVolume - downVolume
                if (newVolume < 1) newVolume = 1
                setDownVolume(downVolume)
                setVolume(newVolume)
            }

            // 再生
            youtube.loadVideoById({ videoId, startSeconds, endSeconds })
        } else {
            // 楽曲が存在しないので終了
            toast('danger', '楽曲が見つかりませんでした...')
            dispatch(PlayerSlice.actions.end())
        }
    }

    const setNext = () => {
        const newList = [...stateList]
        let nextIndex = stateIndex + 1

        // オプション：　プレイリストの自動削除
        if (setting.autoremove) {
            newList.splice(0, nextIndex)
            dispatch(PlaylistSlice.actions.set(newList))
            nextIndex = 0
        }

        // 次が無い＆ループ再生の場合
        if (loop && !newList[nextIndex]) nextIndex = 0

        // 次の曲へ
        if (newList[nextIndex]) {
            console.log('[Player]次の曲へーー')
            dispatch(PlayerSlice.actions.set({ status: 'play', bookmark: nextIndex }))
            setVideo(newList, nextIndex)
        } else {
            console.log('[Player]プレイリストの再生が終了しました')
            dispatch(PlayerSlice.actions.end())
        }
    }

    const togglePlay = () => {
        !layout.sidebar && setController(false)
        dispatch(PlayerSlice.actions.status(player.status === 'play' ? 'pause' : 'play'))
    }

    const seekBeforeChange = () => {
        setSeek(true)
        if (player.status === 'play') {
            youtube.pauseVideo()
            window.clearInterval(interval)
            statePlay = true
        }
    }

    const seekTo = (value: number | number[]) => {
        interval && window.clearInterval(interval)
        youtube.seekTo(value as number)
        setTime({ ...time, current: value as number })
    }

    const seekAfterChange = () => {
        if (statePlay) {
            youtube.playVideo()
            statePlay = false
        }

        process.nextTick(() => setSeek(false))
    }

    const videoTime = (value: number) => {
        let min = Math.floor(value / 60)
        let sec = value % 60
        return `${min}:${sec < 10 ? '0' + sec : sec}`
    }

    const changeVolume = (value: number | number[]) => {
        const newVolume = value as number
        setVolume(newVolume)
        setting.localsave && localStorage.setItem('aiktmvi_volume', String(newVolume))

        // ミュート状態からボリュームを変更した場合はミュート解除
        if (mute && newVolume > 0) setMute(false)

    }

    const debug = () => {
        const endTime = time.total === 0 ? Math.floor(youtube.getDuration()) : time.total
        seekTo(endTime - 5)
    }

    const hoverShowOverlay = () => {
        if (document.fullscreenElement || !layout.sidebar) return false
        if (!env('touch') && player.status === 'play' && layout.sidebar) setOverlay(true)
    }

    const toggleController = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!layout.sidebar) {
            const flag = !controller
            player.status !== 'stop' && setOverlay(flag)
            setController(flag)
        } else {
            env('touch') && setOverlay(!overlay)
        }
    }

    const toggleFullscreen = () => {
        if (setting.fullscreen) {
            !layout.sidebar === true
                ? document.fullscreenElement && document.exitFullscreen()
                : document.body.requestFullscreen()
        }

        dispatch(LayoutSlice.actions.set({ key: 'sidebar', value: !layout.sidebar }))

        if (layout.sidebar) {
            player.status === 'play' && setController(false)
        } else {
            setController(true)
        }
    }

    // Computed
    const youtubeOpt = useMemo(() => {
        const opts = {
            width: '100%',
            height: '100%',
            playerVars: {
                controls: setting.defaultplayer ? 1 : 0,
                playsinline: 1,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,
                wmode: 'transparent'
            }
        }
        return opts as any
    }, [])

    const volumeIcon = useMemo(() => {
        if (mute) {
            return 'volume_off'
        } else if (volume === 0) {
            return 'volume_mute'
        } else if (volume < 50) {
            return 'volume_down'
        } else {
            return 'volume_up'
        }
    }, [volume, mute])

    // Hooks
    useEffect(() => {
        // ボリューム設定をロード
        const localVolume = localStorage.getItem('aiktmvi_volume')
        localVolume && setVolume(Number(localVolume))
        // ミュート設定をロード
        const localMute = localStorage.getItem('aiktmvi_mute')
        localMute && setMute(localMute === 'true' ? true : false)
    }, [])

    useEffect(() => {
        if (youtube) {
            console.log('Status:', youtube.getPlayerState())
            interval && window.clearInterval(interval)

            switch (player.status) {
                case 'play':
                    console.log('[Player]PLAY')
                    youtube.getPlayerState() === 2 && player.bookmark === stateIndex
                        ? youtube.playVideo()
                        : setVideo(playlist, player.bookmark)
                    setOverlay(false)
                    break;

                case 'pause':
                    console.log('[Player]PAUSE')
                    youtube.pauseVideo()
                    setOverlay(true)
                    break;

                case 'stop':
                    console.log('[Player]STOP')
                    youtube.stopVideo()
                    setVolume(volume + downVolume)
                    setDownVolume(0)
                    break;
            }
        }
    }, [player.status])

    useEffect(() => {
        if (youtube && youtube.getPlayerState() === 1 && player.status === 'play' && player.bookmark !== stateIndex) {
            setVideo(playlist, player.bookmark)
        }

        stateIndex = player.bookmark
    }, [player.bookmark])

    useEffect(() => {
        stateList = playlist
    }, [playlist])

    useEffect(() => {
        if (youtube) {
            console.log('[Player]音量を変更します', volume)
            youtube.setVolume(volume)
        }
    }, [youtube, volume])

    useEffect(() => {
        if (youtube) {
            mute ? youtube.mute() : youtube.unMute()
            setting.localsave && localStorage.setItem('aiktmvi_mute', String(mute))
        }
    }, [youtube, mute])

    useEffect(() => {
        const dummyBar = document.querySelector('#player-controller .rc-slider-step') as HTMLElement
        let dummyVolume = volume + downVolume
        if (dummyVolume > 100) dummyVolume = 100
        dummyBar.style.width = downVolume !== 0 ? `${dummyVolume}%` : 'auto'
    }, [volume, downVolume])

    // Render
    return (
        <div id="player">
            <div
                id="player-screen"
                onMouseEnter={hoverShowOverlay}
                onMouseLeave={() => !env('touch') && setOverlay(false)}
                onClick={toggleController}
            >
                <div className="screen">
                    <CSSTransition classNames="screen" in={player.status === 'stop'} timeout={800} unmountOnExit>
                        <div className="title">
                            <img src="/img/logo-white.png" alt="AIKT.MV∞!" />
                            <span className="version">Ver.{process.env.NEXT_PUBLIC_VERSION} Beta</span>
                        </div>
                    </CSSTransition>

                    <CSSTransition classNames="screen" in={eyecatch} timeout={400} unmountOnExit>
                        <div className="eyecatch">
                            <img src="/img/logo-dark.png" alt="AIKT.MV∞!" />
                        </div>
                    </CSSTransition>

                    <CSSTransition classNames="screen" in={!setting.defaultplayer && time.total !== 0 && (player.status === 'pause' || overlay)} timeout={400} unmountOnExit>
                        <div className={`overlay ${player.status}`}>
                            <div className="flex justify-between items-center mb-0.5 px-0.5">
                                <span className="time">
                                    {videoTime(time.current - time.top)} / {videoTime(time.total)}
                                </span>

                                <span className="quality">
                                    {quality}p
                                </span>
                            </div>

                            <div className={`rc-slider-wrapper ${isSeek ? '' : 'animate'}`} onMouseDown={() => setSeek(true)}>
                                <Slider
                                    min={time.top}
                                    max={time.total - 2}
                                    value={time.current}
                                    onBeforeChange={seekBeforeChange}
                                    onChange={seekTo}
                                    onAfterChange={seekAfterChange}
                                />
                            </div>
                        </div>
                    </CSSTransition>

                    <YouTube
                        className={`youtube ${`controls_${setting.defaultplayer ? 1 : 0}`}`}
                        opts={youtubeOpt}
                        onReady={onReady}
                        onPlay={onPlay}
                    />
                </div>
            </div>

            <CSSTransition classNames="controller" in={player.status === 'pause' || controller} timeout={300}>
                <div id="player-controller">
                    <div className="inner">
                        <button type="button" className={`btn-controller seek-controller ${playlist.length && player.status === 'play' ? '' : 'disabled'}`} onClick={() => seekTo(time.top)}>
                            <span className="icon">
                                <Icon font="material" value="skip_previous" />
                            </span>
                        </button>

                        <button type="button" className={`btn-controller play-controller ${playlist.length ? '' : 'disabled'}`} onClick={togglePlay}>
                            <span className="icon">
                                <Icon font="material" value={player.status === 'play' ? 'pause' : 'play_arrow'} />
                            </span>
                        </button>

                        <div className={`btn-controller volume-controller ${mute ? 'mute' : ''} ${downVolume ? 'autovolume' : ''}`}>
                            <button type="button" className="btn-controller-child" onClick={() => setMute(!mute)}>
                                <span className="icon">
                                    <Icon font="material" value={volumeIcon} />
                                </span>
                            </button>
                            {downVolume ? <span className="autovolume-label">↓AUTODOWN↓</span> : ''}
                            <Slider min={0} max={100} value={volume} onChange={changeVolume} />
                        </div>

                        <button type="button" className={`btn-controller loop-controller ${loop && !setting.autoremove ? 'active' : ''} ${setting.autoremove ? 'disabled' : ''}`} onClick={() => setLoop(!loop)}>
                            <span className="icon">
                                <Icon font="material" value="all_inclusive" />
                            </span>
                        </button>

                        <button type="button" className="btn-controller sidebar-controller" onClick={toggleFullscreen}>
                            <Icon font="custom" value={layout.sidebar ? 'scaling-out' : 'scaling-in'} />
                        </button>

                        {/*<button type="button" className="btn-controller" onClick={debug}>
                            <span className="icon text-danger">
                                <Icon font="material" value="skip_next" />
                            </span>
                        </button>*/}
                    </div>
                </div>
            </CSSTransition>
        </div>
    )
}

export default memo(Player)