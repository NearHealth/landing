import { asset } from '../../utils/assetPath'

export default function NearBrand({ size = 'sm', className = '' }) {
  return (
    <div className={`near-brand near-brand--${size} ${className}`.trim()}>
      <img src={asset('assets/icons/near-logo.svg')} alt="Near Health" className="near-brand__icon" />
      <div className="near-brand__wordmark">
        <img src={asset('assets/icons/n.svg')} alt="n" />
        <img src={asset('assets/icons/e.svg')} alt="e" />
        <img src={asset('assets/icons/a.svg')} alt="a" />
        <img src={asset('assets/icons/r.svg')} alt="r" />
      </div>
    </div>
  )
}
