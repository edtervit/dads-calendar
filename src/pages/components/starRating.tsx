import React, {useState} from 'react'
import {trpc} from '../../utils/trpc';

interface props {
  raceRating: number | null;
  winnerRating: number | null;
  raceId: number;
  isAdmin: boolean;
}


function StarRating({ raceRating, winnerRating, raceId, isAdmin}: props) {
  const [starRace, setStarRace] = useState<number | null>(raceRating)
  const [starWinner, setStarWinner] = useState<number | null>(winnerRating)
  const updateStarInDb = trpc.race.updateRating.useMutation();


  const handleStarUpdate = async (newRating: number, type: "winner" | "race") => {
    if (newRating === starRace) {
      const setNullRes = await updateStarInDb.mutateAsync({rating: null, raceId, type})
      if (setNullRes.success) {
        type === 'race' ? setStarRace(null) : setStarWinner(null)
      } else {
        alert('There was an error saving your rating')
        console.log(setNullRes.error)
      }
    }

    if (newRating !== starRace) {
      const setStarRes = await updateStarInDb.mutateAsync({rating: newRating, raceId, type})
      if (setStarRes.success) {
        type === 'race' ? setStarRace(newRating) : setStarWinner(newRating)
      } else {
        alert('There was an error saving your rating')
        console.log(setStarRes.error)
      }
    }
  }

  //if user isn't an admin, return a read only star rating
  if (!isAdmin) {
    return (
      <div className='flex justify-center gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          //if rating is greater than or equal to the star number, return a filled star
          <div className='w-5' key={star}>
            {starRace && starRace >= star ? <img src="star-filled.svg" alt="" /> : <img src="star.svg" alt="" />}
          </div>
        ))}
      </div>
    )
  } else {
    return (
      <>
      <div className='flex justify-center gap-1'>
        W
        {[1, 2, 3, 4, 5].map((star) => (
          //if rating is greater than or equal to the star number, return a filled star
          <div className='w-5 cursor-pointer' key={star} onClick={() => handleStarUpdate(star, 'winner')}>
            {starWinner && starWinner >= star ? <img src="star-filled.svg" alt="" /> : <img src="star.svg" alt="" />}
          </div>
        ))}
      </div>
      <div className='flex justify-center gap-1'>
        R
        {[1, 2, 3, 4, 5].map((star) => (
          //if rating is greater than or equal to the star number, return a filled star
          <div className='w-5 cursor-pointer' key={star} onClick={() => handleStarUpdate(star, 'race')}>
            {starRace && starRace >= star ? <img src="star-filled.svg" alt="" /> : <img src="star.svg" alt="" />}
          </div>
        ))}
      </div>
      </>
    )
  }

}

export default StarRating