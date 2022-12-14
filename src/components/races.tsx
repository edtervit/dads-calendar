import type {Race} from '@prisma/client';
import {useSession} from 'next-auth/react';
import React, {useEffect, useState} from 'react'
import {groupRacesByCourseAndSortByTime} from '../utils/racesUtils';
import {trpc} from '../utils/trpc';
import RaceItem from './race';
import LoadingSpinner from './resuable/loadingSpinner';

interface props {
  date: string
}

interface formattedRaces {
  course: string;
  races: Race[];
}

function Races({date}: props) {
  const [loadingForce, setLoadingForce] = useState(false);
  const [formattedRaces, setFormattedRaces] = useState<formattedRaces[] | null>(null)
  
  const {data: sessionData} = useSession();
  const {data: isAdmin} = trpc.auth.checkIfAdmin.useQuery(
    undefined, // no input
    {enabled: sessionData?.user !== undefined},
  );
  
  const {data: raceData, isLoading, isError, refetch: refetchRaces} = trpc.race.getRaces.useQuery({
    date,
  }
  );

  const {data: rateLimitCount, refetch: refetchRateLimit} = trpc.rateLimit.getTodaysRateLimit.useQuery();

  const {refetch: forceGetRaces} = trpc.race.getRaces.useQuery({date, forceGetRaces: true}, {
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const handleForceGetRaces = async () => {
    setLoadingForce(true);
    //call endpoint to force the new races to be added to the db
    await forceGetRaces()
    //refetch using og query to avoid having to handle the forceGetRaces query
    await refetchRaces()
    //refect the rate limit count
    await refetchRateLimit()
    setLoadingForce(false);
  }

  //useEffect to call getRace on date change
  useEffect(() => {
    refetchRaces()
    //refect the rate limit count
    refetchRateLimit()
  }, [date, refetchRaces])

  //useEffect to log raceData
  useEffect(() => {
    if (raceData?.success && raceData.data) {
      setFormattedRaces(groupRacesByCourseAndSortByTime(raceData.data))
    } else {
      setFormattedRaces([])
    }
  }, [raceData])



  return (
    <div className=' w-full flex items-center flex-col '>
      {isLoading && <LoadingSpinner />}
      {isError && <p>There was an error</p>}
      {formattedRaces && !isLoading && !isError && (
        <>
          {isAdmin && <div className='bg-white/10 rounded-sm p-2 cursor-pointer hover:scale-110 transition-transform' onClick={() => !loadingForce && handleForceGetRaces()}> {loadingForce ? 'Loading...' : 'Force Get Races'}</div>}
          {rateLimitCount && <p className='text-sm'>Race requests remaining today: {rateLimitCount}</p>}
          <div className='text-center flex gap-4 mt-4'>
            {formattedRaces.map((course: formattedRaces) => (
              <div className='border-white border p-4' key={course.course}>
                <h3 className='mb-4 font-bold text-lg'>{course.course}</h3>
                {course.races.map((race: Race) => (
                  <div key={race.time + race.courseId}>
                    <RaceItem race={race} isAdmin={isAdmin ?? false}/>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      {raceData?.error?.map((error: string | unknown, index: number) => (
        <p key={index}>{typeof error === 'string' && error}</p>
      ))}
    </div>
  )
}

export default Races