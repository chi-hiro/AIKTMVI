export const markupTitle = (value: string) => {
    if (value) {
        let returnText: string = value

        if (value.match('er.〜')) {
            returnText = value.replace('.〜', '.〜</small>').replace('〜', '<small>〜')
        }

        if (value.match(' \\(')) {
            returnText = value.replace('(', '<small>(').replace(')', ')</small>')
        }

        return { __html: returnText }
    }
}