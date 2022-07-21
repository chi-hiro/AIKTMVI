import { useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { RouteSlice } from 'store'
import { Scroller, ScrollerRefTypes } from 'components/scroller'
import Icon from 'components/icon'
import Expansion from 'components/expansion'

export default function Report() {
    // Router
    const router = useRouter()

    // Store
    const dispatch = useDispatch()

    // Ref
    const scrollerRef = useRef<ScrollerRefTypes>()

    // Methods
    const routing = (href: string) => {
        const name = href.replace(/\//g, '')
        dispatch(RouteSlice.actions.set({ path: router.asPath, name }))
        window.setTimeout(() => router.push(href), 200)
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
                        <span className="text">要望・不具合報告</span>
                    </h1>
                </div>
            </div>

            <Scroller ref={scrollerRef} theme="tertiary" wrapperClass="sidebar-body sidebar-body-menu">
                <div className="p-10px">
                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">はじめに</span>
                        </h2>

                        <div className="inner">
                            <p>思いつきの要望から、使いづらい箇所や動作がおかしい箇所の報告、ただの感想文まで、こちらからお送りいただけると、作者のやる気がアップしてアプリのレベルも上がっていきます。</p>
                            <p>報告は<mark>わかる範囲で具体的な内容</mark>であれば<mark>文章の書き方に気を遣う必要はありません。</mark>「さすがまどかストレート<span className="text-primary">///</span>」な感じで気軽に送ってください。</p>
                            <p>メッセージは匿名で送信されます。それゆえに返信もありません。送られてきた内容は全て目を通し、様々な視点から検討させていただきます。</p>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">よくある質問</span>
                        </h2>

                        <div className="inner grid gap-0.5">
                            <Expansion title="音が出ません">
                                <div className="expansion-inner">
                                    <p>iOS, Androidでご利用の場合、音は端末の音量に依存しますので設定をご確認ください。</p>
                                    <p>動画を再生すると消音モードでも音が出ますので、音を出したくない場合はアプリからミュートするか、端末の音量を下げてください。</p>
                                </div>
                            </Expansion>

                            <Expansion title="バックグラウンド再生に対応してほしい">
                                <div className="expansion-inner">
                                    <p>YouTube動画を再生した時の挙動は、それぞれのOSや使用ブラウザに依存しますので、アプリ側で対応を行うのが難しいです。</p>
                                    <p>また、作者のポリシーとして「あくまでMVを見るアプリであって、無料で音楽が聴けるアプリのようにしたくない」お気持ちがありますので、対応はとても消極的です。</p>
                                </div>
                            </Expansion>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="inner">
                            <p className="text-center">ボタンを押すとフォームが開きます。</p>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLScaLFlDlcXISivnZXeEqEBkbOg9LQVFrF71nRqaeEf0uhK7wg/viewform" target="_blank" className="btn btn-block is-primary">要望・不具合報告する</a>
                        </div>
                    </div>
                </div>
            </Scroller>
        </>
    )
}