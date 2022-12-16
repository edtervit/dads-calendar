import React from 'react'
import StarRating from './starRating';
import ImageManager from './imageManager';
import type {RaceWithPhotosAndCourse} from '../types/race';

interface props {
  race: RaceWithPhotosAndCourse;
  isAdmin: boolean;
}

function RaceItem({race, isAdmin}: props) {
  return (
    <div className='border-white border mb-4 p-2'>
      <div className='mb-1'>
        {race.time}
      </div>
      <StarRating raceRating={race.raceRating} winnerRating={race.winnerRating} raceId={race.id} isAdmin={isAdmin ?? false} />
      <ImageManager race={race} isAdmin={isAdmin ?? false} />
    </div>
  )
}

export default RaceItem