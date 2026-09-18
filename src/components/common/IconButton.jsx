const ICONS = {
  eye: (
    <path
      d="M1 8s3-5.5 9-5.5S19 8 19 8s-3 5.5-9 5.5S1 8 1 8Z M10 10.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  edit: (
    <path
      d="M12.9 2.6a1.6 1.6 0 0 1 2.3 0l2.2 2.2a1.6 1.6 0 0 1 0 2.3L7 17.5l-4.3.8.8-4.3L12.9 2.6Z M11.3 4.2l4.5 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  trash: (
    <path
      d="M3 5.5h14 M7.5 5.5V3.8c0-.6.5-1.1 1.1-1.1h2.8c.6 0 1.1.5 1.1 1.1v1.7 M5.5 5.5 6.2 17c.05.7.6 1.2 1.3 1.2h5c.7 0 1.25-.5 1.3-1.2l.7-11.5 M8.3 9v5.2 M11.7 9v5.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  plus: (
    <path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  close: (
    <path d="M5 5l10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  menu: (
    <path d="M3 6h14M3 10h14M3 14h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
}

export default function IconButton({ icon, label, onClick, danger = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={`icon-btn${danger ? ' danger' : ''}`}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <svg viewBox="0 0 20 20">{ICONS[icon]}</svg>
    </button>
  )
}
