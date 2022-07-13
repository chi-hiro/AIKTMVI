import { env } from 'lib/env'

export const layout = () => {
    // Variables
    const elm = document.body
    const device = env('userAgent') as string
    const mobile = env('mobile') as boolean
    const orientation = env('orientation') as string

    // Reset
    elm.classList.remove(...elm.classList)

    // isMobileLayout
    let isMobile: boolean = mobile ? true : false

    if (!mobile && window.innerHeight < window.innerWidth / 16 * 9) {
        isMobile = true
    }

    // Set
    const layout = isMobile ? 'mobile' : 'desktop'
    elm.classList.add(layout)
    elm.classList.add(orientation)
    elm.classList.add(device)

    // Return state
    return [layout, orientation, device]
}