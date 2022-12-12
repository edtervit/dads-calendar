import React from 'react'

interface props {
  size?: number,
  thickness?: number,
}

function LoadingSpinner({size = 50, thickness = 4}: props) {
  return (
      <div className="animate-spin rounded-full border-accent" style={{height: size, width: size,borderBottomWidth: thickness, borderTopWidth: thickness}}>
      </div>
  )
}

export default LoadingSpinner