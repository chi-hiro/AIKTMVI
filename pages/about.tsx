import { useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { RouteSlice } from 'store'
import { Scroller, ScrollerRefTypes } from 'components/scroller'
import Icon from 'components/icon'

export default function About() {
    const router = useRouter()
    const dispatch = useDispatch()

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
                        <span className="text">アプリについて</span>
                    </h1>
                </div>
            </div>

            <Scroller ref={scrollerRef} theme="tertiary" wrapperClass="sidebar-body sidebar-body-menu">
                <div className="p-10px">
                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">AIKT.MV∞!とは</span>
                        </h2>

                        <div className="inner">
                            <p>「AIKT.MV∞!」は、アイカツのミュージックビデオを無限に見るのに最適な、<mark>ファンメイドの非公式ウェブアプリ</mark>です。</p>
                            <p>「アイカツ！フアンがよりコンテンツを楽しめるように」「ご新規さんがアイカツ！の楽曲に触れやすいように」「作者のスキルアップのために」を目的に、一人のアイカツおじさんによって作られました。</p>
                            <p>「AIKT.MV∞!」は、クリーンさを重視して制作・運営しています。しかし、著作物を使ったWebサービスを好き勝手に作ってしまっている側面もありますので、親しみやすい名称を定めていません。</p>
                            <p>なんて読めばいいのかわからない「AIKT.MV∞!」は「<mark>アイカツのMVを無限に見るやつ</mark>」とか適当に呼んでください。</p>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">ウェブアプリモード</span>
                        </h2>

                        <div className="inner grid gap-0.5">
                            <p>スマートフォンやタブレットをお使いの方は、ブラウザのメニューから「<mark>ホーム画面に追加</mark>」することで、ウェブアプリモードをご利用いただけます。</p>
                            <p>アプリのように全画面で動作するモードで、この使い方を強く推奨しています。</p>
                            <figure><img src="/img/howto-pwa-ios.jpg" alt="" className="img-fluid" /></figure>
                            <figure><img src="/img/howto-pwa-android.jpg" alt="" className="img-fluid" /></figure>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">推奨ブラウザ</span>
                        </h2>

                        <div className="inner grid gap-0.5">
                            <p><strong>Windows</strong><br />Chrome, Edge</p>
                            <p><strong>Mac</strong><br />Chrome, Safari</p>
                            <p><strong>iOS（13以上）</strong><br />Safari</p>
                            <p><strong>Android（6.0以上）</strong><br />Chrome</p>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">ポリシー</span>
                        </h2>

                        <div className="inner grid gap-0.5">
                            <p>「AIKT.MV∞!（以下当アプリと呼ぶ）」は、クリーンな二次創作でありたいと考えています。大好きな作品を題材に勉強させてもらう目的で著作物をお借りし、金銭目的で活動することはありません。</p>
                            <p>当アプリでは、すべてのコンテンツを匿名で利用でき、利用者の情報を収集することはありません。</p>
                            <p>当アプリでは、音楽を含む動画を埋め込み表示しているところから、某著作権団体のルールに則り、広告を表示して収入を得る行為は行いません。ただし、YouTube側から強制的に広告が表示される場合があります。なお、広告ブロックを適用してもアプリは問題なく動きます。</p>
                            <p>取り扱うコンテンツは公式から配信されている物のみで、第三者のモラルに反したページに繋がることはありません。Youtube動画はGoogleの規約に沿って使用しています。全ての方に安全にご利用いただけるよう運営してまいります。</p>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">おねがい</span>
                        </h2>

                        <div className="inner grid gap-0.5">
                            <p>「AIKT.MV∞!」は皆さんの好きなように使い、人に教え、広めてもらって構いません。（作者に影響力がないのでむしろありがたい）アイカツの曲を知ってもらうネタの一つとして活用してもらえれば幸いです。</p>
                            <p>ただし、公式に迷惑がかかるような使い方や広め方は控えてくださいますよう、よろしくお願いします。</p>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h2 className="heading">
                            <span className="text">作者</span>
                        </h2>

                        <div className="inner grid gap-0.5">
                            <p><strong>chi*hiro</strong> (<a href="https://twitter.com/frostive" target="_blank">twitter</a>)<br />AIKT.MV∞!やアイカツのことだけツイートしているわけではないので、情報発信を目当てにフォローするのはお勧めしません。</p>
                        </div>
                    </div>
                </div>
            </Scroller>
        </>
    )
}