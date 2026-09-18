import { useEffect } from 'react'
import IconButton from './IconButton'

export default function Modal({ title, onClose, children, footer, wide = false }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-panel${wide ? ' wide' : ''}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <IconButton icon="close" label="Đóng" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
