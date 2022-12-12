import {Race} from '@prisma/client';
import React, {useEffect, useState} from 'react'
import {groupRacesByCourseAndSortByTime} from '../../utils/racesUtils';
import {trpc} from '../../utils/trpc';
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
  const [formattedRaces, setFormattedRaces] = useState<formattedRaces[] | null>(null)
  const {data: raceData, isLoading, isError, refetch: refetchRaces} = trpc.race.getRaces.useQuery(
    date,
  );

  //useEffect to call getRace on date change
  useEffect(() => {
    refetchRaces()
  }, [date])

  //useEffect to log raceData
  useEffect(() => {
    console.log(raceData)
    if(raceData?.success && raceData.data){
      console.log(groupRacesByCourseAndSortByTime(raceData.data))
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
        <div className='text-center flex gap-4'>
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
      )}
      {raceData?.error?.map((error: string|unknown, index: number) => (
        <p key={index}>{typeof error === 'string' && error}</p>
      ))}
    </div>
  )
}

export default Races