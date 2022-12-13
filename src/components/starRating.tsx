import Image from 'next/image';
import React, {useState} from 'react'
import {trpc} from '../utils/trpc';
import LoadingSpinner from './resuable/loadingSpinner';

interface props {
  raceRating: number | null;
  winnerRating: number | null;
  raceId: number;
  isAdmin: boolean;
}


function StarRating({raceRating, winnerRating, raceId, isAdmin}: props) {
  const [starRace, setStarRace] = useState<number | null>(raceRating)
  const [starWinner, setStarWinner] = useState<number | null>(winnerRating ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [savingWinner, setSavingWinner] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false)
  const [tempRating, setTempRating] = useState<number | undefined>(winnerRating ?? undefined)
  const updateRatingInDb = trpc.race.updateRating.useMutation();


  const handleStarUpdate = async (newRating: number, type: "winner" | "race") => {
    //do nothing if user isn't admin
    if (!isAdmin) return;
    setIsLoading(true);

    if (newRating === starRace && type === 'race') {
      const setNullRes = await updateRatingInDb.mutateAsync({rating: null, raceId, type})
      if (setNullRes.success) {
        setStarRace(null)
        setIsLoading(false);
      } else {
        alert('There was an error saving your rating')
        setIsLoading(false);
        console.error(setNullRes.error)
      }
    }

    if (newRating !== starRace && type === 'race') {
      const setStarRes = await updateRatingInDb.mutateAsync({rating: newRating, raceId, type})
      if (setStarRes.success) {
        setStarRace(newRating)
        setIsLoading(false);
      } else {
        alert('There was an error saving your rating')
        setIsLoading(false);
        console.error(setStarRes.error)
      }
    }
    setIsLoading(false);
  }

  const handleWinnerUpdate = async (newRating: number | undefined) => {
    //do nothing if user isn't admin
    if (!isAdmin) return;
    setSavingWinner(true);

    if (newRating === undefined) {
      const setNullRes = await updateRatingInDb.mutateAsync({rating: null, raceId, type: 'winner'})
      if (setNullRes.success) {
        setStarWinner(null)
        setTempRating(undefined)
        setSavingWinner(false);
        setEnableEdit(false);
      } else {
        alert('There was an error saving your rating')
        setSavingWinner(false);
        setEnableEdit(false);
        console.error(setNullRes.error)
      }
    }

    if (newRating !== undefined) {
      const setWinnerRes = await updateRatingInDb.mutateAsync({rating: newRating, raceId, type: 'winner'})
      if (setWinnerRes.success) {
        setStarWinner(newRating)
        setTempRating(newRating)
        setSavingWinner(false);
        setEnableEdit(false);
      } else {
        alert('There was an error saving your rating')
        setSavingWinner(false);
        setEnableEdit(false);
        console.error(setWinnerRes.error)
      }
    }
    setSavingWinner(false);
  }

  //if user isn't an admin, return a read only star rating

  return (
    isLoading ? <div className='flex justify-center'><LoadingSpinner /></div> : (
      <>
        {enableEdit && (
          <div className='flex flex-col items-center justify-center p-4 absolute z-10 w-full left-0 min-h-screen h-full bg-black/75 top-0' onClick={() => setEnableEdit(false)}>
            <div className='bg-black p-10 w-1/2 flex flex-col items-center' onClick={(e) => e.stopPropagation()}>
              <input type='number' min={0} max={200} className='bg-black border-white border mb-4 w-20 text-center' value={tempRating ?? ''} onChange={(e) => setTempRating(parseInt(e.target.value) > 200 ? 200 : parseInt(e.target.value))} />
              <input id="large-range" min={0} max={200} onChange={(e) => setTempRating(parseInt(e.target.value))} type="range" value={tempRating ?? 0} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-[#9f0000]"></input>
              <div className='flex gap-4 mt-4 items-center justify-center'>
                <p onClick={() => setTempRating(undefined)} className='border-gray-800 border px-2 py-1 rounded-md cursor-pointer'>Clear</p>
                <p onClick={() => !savingWinner && handleWinnerUpdate(tempRating)} className='bg-[#6d0202] px-4 py-1 rounded-md cursor-pointer hover:scale-110 transition-all'>{savingWinner ? <LoadingSpinner size={24} thickness={2} /> : 'Save'} </p>
              </div>
              <div className='mt-4 p-2 cursor-pointer' onClick={() => setEnableEdit(false)}>
                <p className='text-sm text-gray-500' >Cancel</p>
              </div>
            </div>
          </div>
        )}
        <div className={`flex items-center  mb-2 ${isAdmin ? 'cursor-pointer' : ''}`} onClick={() => isAdmin && setEnableEdit(true)}>
          <div className='absolute'>W</div>
          {<div className='mx-auto px-1 '>{starWinner ?? ' -- '}</div>}
        </div>
        <div className='flex justify-center gap-2'>
          R
          {[1, 2, 3, 4, 5].map((star) => (
            //if rating is greater than or equal to the star number, return a filled star
            <div className={`w-5 ${isAdmin ? 'cursor-pointer' : ''}`} key={star} onClick={() => handleStarUpdate(star, 'race')}>
              {starRace && starRace >= star ? <Image width={20} height={20} src="/star-filled.svg" alt="star" /> : <Image width={20} height={20} src="/star.svg" alt="star" />}
            </div>
          ))}
        </div>
      </>
    )
  )
}


export default StarRating