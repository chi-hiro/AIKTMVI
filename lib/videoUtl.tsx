export const seriesData: { [key: string]: any }[] = [
    {
        uid: 'planet',
        name: 'アイカツプラネット！'
    },
    {
        uid: 'onparade',
        name: 'アイカツオンパレード！'
    },
    {
        uid: 'friends',
        name: 'アイカツフレンズ！'
    },
    {
        uid: 'stars',
        name: 'アイカツスターズ！'
    },
    {
        uid: 'aikatsu',
        name: 'アイカツ！'
    },
    {
        uid: 'photokatsu',
        name: 'フォトonステージ！！'
    },
    {
        uid: 'others',
        name: 'その他'
    }
]


const seriesArrayData: string[] = []
seriesData.map(item => seriesArrayData.push(item.uid))
export const seriesArray = seriesArrayData

export const seriesTitle = (id: string) => {
    return seriesData.find(item => id === item.uid && item)?.name
}

export const typeClass = (src: string[]) => {
    let returnData: string = ''
    src && src.forEach(item => returnData = returnData + item)
    return returnData
}