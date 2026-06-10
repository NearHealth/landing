import './VideoPlayOverlay.css'

/**
 * Manual fallback shown when the browser refuses muted autoplay (iOS Low
 * Power Mode, Android Data Saver, Safari per-site auto-play setting). The
 * whole video area is the tap target; the glyph is just the affordance.
 * Rendered as a sibling of the <video> inside its rounded overflow-hidden
 * card, so position:absolute fills exactly the video box.
 */
export default function VideoPlayOverlay({ onPlay }) {
  return (
    <button type="button" className="video-play-overlay" aria-label="Play video" onClick={onPlay}>
      <span className="video-play-overlay-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      </span>
    </button>
  )
}
