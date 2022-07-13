import { createRoot } from 'react-dom/client'

export const toast = (theme: string, message: string) => {
    const container = document.querySelector('#toast')!

    if (container.querySelector('#toast .notification')) {
        return false
    }

    let icon: string

    switch (theme) {
        case 'success':
            icon = 'check_circle'
            break

        case 'info':
            icon = 'info'
            break

        case 'warning':
            icon = 'warning'
            break

        case 'danger':
            icon = 'cancel'
            break

        default:
            icon = 'info'
            break
    }

    const root = createRoot(container)
    root.render(
        <div className={`notification bg-${theme}`}>
            <div className="icon">
                <span className="material-icons-round">{icon}</span>
            </div>
            <div className="body">
                {message}
            </div>
        </div>
    )

    // Show
    setTimeout(() => container.querySelector('.notification')?.classList.add('active'), 100)

    // Hide
    setTimeout(() => container.querySelector('.notification')?.classList.remove('active'), 4000)

    // Remove
    setTimeout(() => root.unmount(), 4300)
}