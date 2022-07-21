import 'styles/bundle.scss'
import 'styles/tailwind.scss'
import { useEffect, useState, useRef } from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { store, LayoutSlice } from 'store'
import { polyfill } from 'smoothscroll-polyfill'
import { env } from 'lib/env'
import { layout } from 'lib/layout'
import Launcher from 'components/launcher'
import Player from 'components/player'
import Dashboard from 'components/dashboard'
import Sidebar from 'components/sidebar'
import BottomNavigation from 'components/bottom-navigation'
import Loader from 'components/loader'
import { PresetModal, PresetModalRefTypes } from 'components/modal-preset'

let isResize: number = 0

export default function App({ Component, pageProps }: AppProps) {
    // Ref
    const presetModalRef = useRef<PresetModalRefTypes>()

    // State
    const [viewport, setViewport] = useState<string>('user-scalable=no, width=390, viewport-fit=cover')
    const [isLoad, setLoad] = useState<boolean>(false)

    // Methods
    const setLayout = () => {
        const payload = layout()
        store.dispatch(LayoutSlice.actions.set({ key: 'env', value: payload }))
        setViewport(env('viewport') as string)

        if (env('mobile') && payload[0] === 'mobile') {
            store.dispatch(LayoutSlice.actions.set({ key: 'sidebar', value: payload[1] === 'portrait' ? true : false }))
        }
    }

    // Hooks
    useEffect(() => {
        polyfill()
        setLayout()

        window.addEventListener('resize', () => {
            window.clearTimeout(isResize)
            isResize = window.setTimeout(() => setLayout(), 200)
        })
    }, [])

    // Render
    return (
        <Provider store={store}>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content={viewport} />
                <meta name="format-detection" content="telephone=no" />
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-title" content="AIKT.MV∞!" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black" />

                <meta property="og:title" content="AIKT!.MV∞" />
                <meta property="og:site_name" content="AIKT!.MV∞" />
                <meta property="og:description" content="アイカツ！のミュージックビデオを無限に見たくなったときに開くウェブアプリ" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://aiktmvi.vercel.app" />
                <meta property="og:image" content="https://aiktmvi.vercel.app/thumb.jpg" />

                <meta name="twitter:site" content="@frostive" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="AIKT!.MV∞" />
                <meta name="twitter:url" content="https://aiktmvi.vercel.app" />
                <meta name="twitter:description" content="アイカツ！のミュージックビデオを無限に見たくなったときに開くウェブアプリ" />
                <meta name="twitter:image" content="https://aiktmvi.vercel.app/thumb.jpg" />

                <link rel="icon" href="/img/favicon192.png" type="image/png" sizes="192x192" />
                <link rel="apple-touch-icon" href="/img/favicon180.png" />
                <link rel="manifest" href="/manifest.json" />
                <title>AIKT.MV∞!</title>
            </Head>

            <Launcher setLoad={() => setLoad(true)} />

            {isLoad && (
                <>
                    <main>
                        <Player />
                        <Dashboard />
                    </main>

                    <Sidebar>
                        <Component {...pageProps} />
                        <PresetModal ref={presetModalRef} />
                        <BottomNavigation callParentMethod={(e) => presetModalRef.current?.showModal(e)} />
                        <Loader />
                    </Sidebar>
                </>
            )}

            <div id="toast"></div>
        </Provider>
    )
}