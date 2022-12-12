import React from 'react'
import LoadingSpinner from './loadingSpinner'

interface props {
  message?: string
}

function LoadingScreenBlocker({message}: props) {
  return (
    <div className='absolute w-full bg-black bg-opacity-50 h-screen z-10 flex justify-center items-center flex-col'>
    <LoadingSpinner size={100} thickness={8}/>
    {message && <p className='text-sm bg-black p-4'>{message}</p>}
    </div>
  )
}

export default LoadingScreenBlocker