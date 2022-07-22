import { createRoot } from 'react-dom/client'
import Notification from '@/components/notification'

export const toast = (theme: string, message: string, position?: string) => {
    const container = document.createElement('div')
    container.classList.add('notification-dummy')
    document.body.appendChild(container)
    createRoot(document.querySelector('.notification-dummy')!).render(
        <Notification theme={theme} position={position}>{message}</Notification>
    )
}