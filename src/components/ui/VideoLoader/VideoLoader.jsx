import './VideoLoader.css'

/**
 * Loading spinner shown over the poster while a <video> is fetching/buffering
 * with no frame to paint yet (driven by useVideoPlayback's `loading`).
 *
 * Always mounted; visibility is a CSS attribute toggle so we get an asymmetric
 * transition: a DELAYED fade-in (the clip usually loads before the delay
 * elapses, so fast loads never flash a spinner) and a FAST fade-out the moment
 * frames arrive. Same dark-glass chip as VideoPlayOverlay so it reads on any
 * poster; sibling of the <video> inside its rounded overflow-hidden card, so
 * position:absolute fills the video box exactly.
 */
export default function VideoLoader({ loading }) {
  return (
    <div className="video-loader" data-loading={loading ? 'true' : 'false'} aria-hidden="true">
      <span className="video-loader-chip">
        <span className="video-loader-spinner" />
      </span>
    </div>
  )
}
