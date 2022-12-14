import type {Race} from '@prisma/client';
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
  const [remainingRequests, setRemainingRequests] = useState<string | null>(null)
  const [formattedRaces, setFormattedRaces] = useState<formattedRaces[] | null>(null)
  const {data: raceData, isLoading, isError, refetch: refetchRaces} = trpc.race.getRaces.useQuery({
    date,
  }
  );
  
  const {data: forcedData, refetch: forceGetRaces } = trpc.race.getRaces.useQuery({date, forceGetRaces: true}, {
    enabled: false, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const handleForceGetRaces = async () => {
    setLoadingForce(true);
    //call endpoint to force the new races to be added to the db
    await forceGetRaces()
    await refetchRaces()
    setLoadingForce(false);
  }
  
  //useEffect to call getRace on date change
  useEffect(() => {
    refetchRaces()
  }, [date, refetchRaces])

  //useEffect to log raceData
  useEffect(() => {
    if(raceData?.success && raceData.data){
      setFormattedRaces(groupRacesByCourseAndSortByTime(raceData.data))
    } else {
      setFormattedRaces([])
    }
  }, [raceData])
  
  //useEffect to get requests remaining from forcedData
  useEffect(() => {
    if(forcedData?.success && forcedData && forcedData.requestsRemaining){
      setRemainingRequests(forcedData.requestsRemaining)
    }
  }, [forcedData])

  return (
    <div className=' w-full flex items-center flex-col '>
      {isLoading && <LoadingSpinner />}
      {isError && <p>There was an error</p>}
      {formattedRaces && !isLoading && !isError && (
        <>
        <div className='bg-white/10 rounded-sm p-2 cursor-pointer hover:scale-110 transition-transform' onClick={() => !loadingForce &&  handleForceGetRaces()}> {loadingForce ? 'Loading...': 'Force Get Races'}</div>
        {remainingRequests && <p className='text-sm'>Race requests remaining today: {remainingRequests}</p>}
        <div className='text-center flex gap-4 mt-4'>
          {formattedRaces.map((course: formattedRaces) => (
            <div className='border-white border p-4' key={course.course}>
              <h3 className='mb-4 font-bold text-lg'>{course.course}</h3>
              {course.races.map((race: Race) => (
                <div key={race.time + race.courseId}>
                  <RaceItem race={race} />
                </div>
              ))}
            </div>
          ))}
        </div>
        </>
      )}
      {raceData?.error?.map((error: string|unknown, index: number) => (
        <p key={index}>{typeof error === 'string' && error}</p>
      ))}
    </div>
  )
}

export default Races