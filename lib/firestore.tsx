import { db } from 'lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export const getCollection = async (dir: string) => {
    const SSdata = sessionStorage.getItem(`aiktmvi_${dir}`)

    if (SSdata) {
        console.log(`[App]セッションから${dir}を読み込みました`)
        return JSON.parse(SSdata)
    } else {
        const data: Array<{ [key: string]: any }> = []
        const querySnap = await getDocs(collection(db, dir))

        querySnap.forEach(doc => {
            data.push(...doc.data().value)
        })

        return new Promise((resolve, reject) => {
            if (data.length) {
                console.log(`[App]Firestoreから${dir}を読み込みました`)
                sessionStorage.setItem(`aiktmvi_${dir}`, JSON.stringify(data))
                resolve(data)
            } else {
                reject(`[App]Firestoreから${dir}を読み込めませんでした...`)
            }
        })
    }
}