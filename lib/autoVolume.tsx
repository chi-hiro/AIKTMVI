export const getDownVolume = (videoId: string) => {
    switch (videoId) {
        // Good morning my dream
        case 'w4ahAWyfEDM':
        return 10

        // 永遠の灯
        case 'jw8AtLSBAYM':
        return 15

        // SHINING LINE
        case 'gjazlka1SrE':
        return 5

        // ハートのメロディ
        case 'EzPo_rMThkM':
        return 15

        // オトナモード
        case 'zg6D0-_oRAc':
        return 10

        // Kira pata shining
        case 'JgoS6oyV-P4':
        return 12

        // サマーマジック
        case 'QPkgdZvLhfA':
        return 20

        // 輝きのエチュード
        case 'HnV6KQPbwOM':
        return 22

        // 該当しない
        default:
        return 0
    }
}