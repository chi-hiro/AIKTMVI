const duplicatedArray = (a1: string[], a2: string[]) => {
    return [...new Set([...a1, ...a2].filter(item => a1.includes(item) && a2.includes(item)))]
}

const uniqueArray = (a1: string[], a2: string[]) => {
    return [...new Set([...a1, ...a2].filter(item => !a1.includes(item) && !a2.includes(item)))]
}

export const reCreatorData = (src: { [key: string]: any } | undefined) => {
    const array: Array<{ label: string, name: string }> = []

    if (src) {
        let arrayC1: string[] = src.creator1 ? src.creator1.split('、') : []
        let arrayC2: string[] = src.creator2 ? src.creator2.split('、') : []
        let arrayC3: string[] = src.creator3 ? src.creator3.split('、') : []
        let arrayC4: string[] = src.creator4 ? src.creator4.split('、') : []

        // 作曲・編曲を抽出
        let arrayC2C3: string[] = duplicatedArray(arrayC2, arrayC3)
        if (arrayC2C3.length) {
            arrayC2 = uniqueArray(arrayC2, arrayC2C3)
            arrayC3 = uniqueArray(arrayC3, arrayC2C3)
        }

        // 作詞・作曲・編曲を抽出
        let arrayC1C2C3: string[] = duplicatedArray(arrayC1, arrayC2C3)
        if (arrayC1C2C3.length) {
            arrayC1 = uniqueArray(arrayC1, arrayC1C2C3)
            arrayC2C3 = uniqueArray(arrayC2C3, arrayC1C2C3)
        }

        // 作詞・作曲を抽出
        let arrayC1C2: string[] = duplicatedArray(arrayC1, arrayC2)
        if (arrayC1C2.length) {
            arrayC1 = uniqueArray(arrayC1, arrayC1C2)
            arrayC2 = uniqueArray(arrayC2, arrayC1C2)
        }

        // 配列を作成
        arrayC1.map(item => item && array.push({ label: '作詞', name: item }))
        arrayC1C2.map(item => item && array.push({ label: '作詞・作曲', name: item }))
        arrayC1C2C3.map(item => item && array.push({ label: '作詞・作曲・編曲', name: item }))
        arrayC2.map(item => item && array.push({ label: '作曲', name: item }))
        arrayC2C3.map(item => item && array.push({ label: '作曲・編曲', name: item }))
        arrayC3.map(item => item && array.push({ label: '編曲', name: item }))
        arrayC4.map(item => item && array.push({ label: '振付師', name: item }))
    }

    return array
}

export const getDBData = (db: { [key: string]: any }, uid: string, data: string) => {
    return db.find((item: { [key: string]: any }) => uid === item.uid && item)[data]
}