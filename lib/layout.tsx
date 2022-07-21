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
    let layout: string = mobile ? 'mobile' : 'desktop'

    if (!mobile && window.innerHeight < window.innerWidth / 16 * 9) {
        layout = 'desktop-sm'
    }

    // Set
    elm.classList.add(layout)
    elm.classList.add(orientation)
    elm.classList.add(device)

    // Return state
    return [layout, orientation, device]
}