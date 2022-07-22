import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit'
import { seriesArray } from 'lib/videoUtl'
let localsave = true

// Route
export type RouteTypes = {
    path: string,
    name: string
}

const initialRoute: RouteTypes = {
    path: 'dummypath',
    name: 'dummyname'
}

export const RouteSlice = createSlice({
    name: 'route',
    initialState: initialRoute,
    reducers: {
        set(state: RouteTypes, action: PayloadAction<RouteTypes>) {
            return action.payload
        }
    }
})

// Database
export type DatabaseTypes = {
    [key: string]: Array<{ [key: string]: any }>
}

const initialDatabase: DatabaseTypes = {
    master: [],
    vocal: [],
    chara: [],
    notification: []
}

export const DatabaseSlice = createSlice({
    name: 'database',
    initialState: initialDatabase,
    reducers: {
        set(state: DatabaseTypes, action: PayloadAction<{ key: string, value: Array<{ [key: string]: any }> }>) {
            return { ...state, [action.payload.key]: action.payload.value }
        }
    }
})

// Layout
export type LayoutTypes = {
    env: string[],
    sidebar: boolean
}

const initialLayout: LayoutTypes = {
    env: [],
    sidebar: true
}

type LayoutAction =
    | { key: 'env', value: LayoutTypes['env'] }
    | { key: 'sidebar', value: LayoutTypes['sidebar'] }

export const LayoutSlice = createSlice({
    name: 'layout',
    initialState: initialLayout,
    reducers: {
        set(state: LayoutTypes, action: PayloadAction<LayoutAction>) {
            if (localsave && action.payload.key === 'sidebar') {
                localStorage.setItem('aiktmvi_sidebar', String(action.payload.value))
            }
            return { ...state, [action.payload.key]: action.payload.value }
        }
    }
})

// Player
export type PlayerTypes = {
    status: string,
    bookmark: number
}

const initialPlayer: PlayerTypes = {
    status: 'stop',
    bookmark: 0
}

export const PlayerSlice = createSlice({
    name: 'player',
    initialState: initialPlayer,
    reducers: {
        set(state: PlayerTypes, action: PayloadAction<PlayerTypes>) {
            return { ...state, ...action.payload }
        },

        status(state: PlayerTypes, action: PayloadAction<string>) {
            return { ...state, status: action.payload }
        },

        bookmark(state: PlayerTypes, action: PayloadAction<number>) {
            localsave && localStorage.setItem('aiktmvi_bookmark', String(action.payload ))
            return { ...state, bookmark: action.payload }
        },

        end() {
            return initialPlayer
        }
    }
})

// Videolist, Playlist
export type ListTypes = {
    data: string[]
}

const initialList: ListTypes = {
    data: []
}

export const VideolistSlice = createSlice({
    name: 'Videolist',
    initialState: initialList,
    reducers: {
        set(state: ListTypes, action: PayloadAction<ListTypes['data']>) {
            return { data: action.payload }
        }
    }
})

export const PlaylistSlice = createSlice({
    name: 'Playlist',
    initialState: initialList,
    reducers: {
        set(state: ListTypes, action: PayloadAction<ListTypes['data']>) {
            localsave && localStorage.setItem('aiktmvi_playlist', JSON.stringify(action.payload))
            return { data: action.payload }
        },

        clear() {
            localsave && localStorage.setItem('aiktmvi_playlist', JSON.stringify([]))
            return { data: [] }
        }
    }
})

// Filter
export type FilterTypes = {
    series: string[],
    keyword: { key: string, value: string }
}

const initialFilter: FilterTypes = {
    series: seriesArray,
    keyword: { key: '', value: '' }
}

export const FilterSlice = createSlice({
    name: 'filter',
    initialState: initialFilter,
    reducers: {
        setSeries(state: FilterTypes, action: PayloadAction<FilterTypes['series']>) {
            return { ...state, series: action.payload }
        },

        resetSeries(state: FilterTypes) {
            return { ...state, series: seriesArray }
        },

        setKeyword(state: FilterTypes, action: PayloadAction<FilterTypes['keyword']>) {
            return {
                series: seriesArray,
                keyword: action.payload
            }
        },

        reset() {
            return initialFilter
        }
    }
})

// Setting
export type SettingTypes = {
    [key: string]: boolean
}

const initialSetting: SettingTypes = {
    localsave: true,
    portrait: false,
    fullscreen: false,
    autoplay: true,
    autoremove: false,
    autovolume: true,
    shownovideo: true,
    a060skip: true,
    s033skip: true,
    p016skip: true,
    defaultplayer: false
}

export const SettingSlice = createSlice({
    name: 'setting',
    initialState: initialSetting,
    reducers: {
        load(state: SettingTypes, action: PayloadAction<{ [key: string]: boolean }>) {
            localsave = action.payload.localsave
            return action.payload
        },

        set(state: SettingTypes, action: PayloadAction<{ key: string, value: boolean }>) {
            const newState = { ...state, [action.payload.key]: action.payload.value }
            if (action.payload.key === 'localsave') {
                localsave = action.payload.value
                !localsave && localStorage.removeItem('aiktmvi_setting')
            }

            if (localsave || (action.payload.key === 'localsave' && localsave)) {
                localStorage.setItem('aiktmvi_setting', JSON.stringify(newState))
            }
            return newState
        },

        reset() {
            return initialSetting
        }
    }
})

// Loader
export type LoaderTypes = {
    status: boolean
}

const initialLoader: LoaderTypes = {
    status: false
}

export const LoaderSlice = createSlice({
    name: 'loader',
    initialState: initialLoader,
    reducers: {
        show(state: LoaderTypes) {
            return { status: true }
        },

        hide(state: LoaderTypes) {
            return { status: false }
        }
    }
})

// ConfigureStore
export const store = configureStore({
    reducer: {
        route: RouteSlice.reducer,
        database: DatabaseSlice.reducer,
        layout: LayoutSlice.reducer,
        player: PlayerSlice.reducer,
        videolist: VideolistSlice.reducer,
        playlist: PlaylistSlice.reducer,
        filter: FilterSlice.reducer,
        setting: SettingSlice.reducer,
        loader: LoaderSlice.reducer
    }
})