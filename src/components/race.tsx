import type {Race} from '@prisma/client'
import {useSession} from 'next-auth/react';
import React from 'react'
import {trpc} from '../utils/trpc';
import StarRating from './starRating';

interface props {
  race: Race
}

function RaceItem({race}: props) {
  const {data: sessionData} = useSession();
  const {data: isAdmin} = trpc.auth.checkIfAdmin.useQuery(
    undefined, // no input
    {enabled: sessionData?.user !== undefined},
  );
  return (
    <div className='border-white border mb-4 p-2'>
      <div className='mb-1'>
        {race.time}
      </div>
      <StarRating raceRating={race.raceRating} winnerRating={race.winnerRating} raceId={race.id} isAdmin={isAdmin ?? false} />
    </div>
  )
}

export default RaceItem