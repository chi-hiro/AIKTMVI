export function env(checkData: string) {
    const breakpoint = 1024
    const ua = window.navigator.userAgent.toLowerCase()

    switch (checkData) {
        case 'userAgent':
            if (/ipod|iphone/.test(ua) || (/android/.test(ua) && /mobile/.test(ua))) {
                return 'view_sp'
            } else if ((/ipad|macintosh/.test(ua) && 'ontouchend' in document) || (/android/.test(ua) && !/mobile/.test(ua))) {
                return 'view_tb'
            } else {
                return 'view_pc'
            }

        case 'touch':
            return 'ontouchstart' in window

        case 'orientation':
            return (window.innerWidth < window.innerHeight) ? 'portrait' : 'landscape'

        case 'viewport':
            if (window.innerWidth >= breakpoint || window.innerWidth > window.innerHeight || (/ipad|macintosh/.test(ua) && 'ontouchend' in document) || (/android/.test(ua) && !/mobile/.test(ua))) {
                return 'initial-scale=1.0, user-scalable=no, width=device-width, minimum-scale=1.0, maximum-scale=1.0'
            } else {
                return 'user-scalable=no, width=390, viewport-fit=cover'
            }

        case 'font':
            switch (document.documentElement.lang) {
                case 'ja':
                    return 'font_jp'

                case 'zh-CN':
                    return 'font_cn'

                case 'zh-TW':
                    return 'font_tw'

                case 'en':
                    return 'font_en'
            }

        case 'breakpoint':
            return breakpoint

        case 'mobile':
            return window.innerWidth < breakpoint
    }
}