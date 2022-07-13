export function getTouchPosition(event: any, direction: string) {
    if (event.changedTouches) {
        switch (direction) {
            case 'X':
                return event.changedTouches[0].pageX

            case 'Y':
                return event.changedTouches[0].pageY

            default:
                return 0
        }
    } else {
        switch (direction) {
            case 'X':
                return event.pageX

            case 'Y':
                return event.pageY

            default:
                return 0
        }
    }
}
