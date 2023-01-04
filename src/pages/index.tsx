import {type NextPage} from "next";
import Head from "next/head";
import {signIn, signOut, useSession} from "next-auth/react";

import {trpc} from "../utils/trpc";
import Datepicker from "react-tailwindcss-datepicker";
import {useEffect, useState} from "react";
import Races from "../components/races";
import Link from "next/link";
import LoadingSpinner from "../components/resuable/loadingSpinner";
import {DateTime} from "luxon";

const Home: NextPage = () => {
  const [date, setDate] = useState<{startDate: string | Date | null; endDate: string | Date | null;} | null>({
    //formatting date to YYYY-MM-DD
    startDate: DateTime.now().toFormat('yyyy-MM-dd'),
    endDate: DateTime.now().toFormat('yyyy-MM-dd'),
  });
  const handleDateChange = (newValue: {startDate: string | Date | null; endDate: string | Date | null;} | null) => {
    if (!newValue) return;
    //check if newValue.startDate is in the future
    if (newValue.startDate && new Date(newValue.startDate) > new Date()) {
      alert("You can't select a date in the future")
      return;
    }
    const date = new Date(newValue.startDate as string)
    const formattedDate = DateTime.fromISO(date.toISOString()).toFormat('yyyy-MM-dd')
    setDate({startDate: formattedDate, endDate: formattedDate});
  }
  const {data: sessionData} = useSession();

  return (
    <>
      <Head>
        <title>Ned&apos;s Racing Calendar</title>
        <meta name="description" content="Ned's Racing Calendar" />
        <link rel="icon" href="/favi.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center  bg-gradient-to-b from-[#6d0202] to-[#2c1515] text-white">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 pt-16 pb-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(0,100%,70%)]"> Ned&apos;s </span>Racing Calendar
          </h1>
          <Auth />
          {sessionData && (
            <div className="flex justify-center flex-col items-center">
              <Datepicker
                value={date}
                asSingle={true}
                useRange={false}
                primaryColor={"red"}
                onChange={handleDateChange}
              />
            </div>
          )}
        </div>
        {sessionData && date && typeof date.startDate === 'string' && <Races date={date.startDate} />}
      </main>
    </>
  );
};

export default Home;

export const Auth: React.FC = () => {
  const {data: sessionData, status: autoLoginStatus} = useSession();
  
  // useEffect to console log any change to autologinstatus
  useEffect(() => {
    console.log(autoLoginStatus)
  }, [autoLoginStatus])
    

  const {data: isAdmin} = trpc.auth.checkIfAdmin.useQuery(
    undefined, // no input
    {enabled: sessionData?.user !== undefined},
  );

  return (
    <>
      {isAdmin && <nav className="my-2">
        <Link href={'/'} className='border white p-2' >Home</Link>
        <Link href={'/users'} className='border white p-2' >Users</Link>
      </nav>}
      <div className="flex items-center justify-center gap-2">
        <p className="text-center text-white text-xs">
          {sessionData && <span>Logged in as {sessionData.user?.email} - </span>}
          {isAdmin && <span> Hi Ned, full read and write access available.</span>}
          {sessionData && !isAdmin && <span> You have read-only access.</span>}
        </p>
        {autoLoginStatus !== 'loading' && <button
          className={`${!sessionData ? 'rounded-full bg-white/10 px-10 py-3 mt-2 font-semibold text-white no-underline transition hover:bg-white/20' : 'rounded-full bg-white/10 px-4 py-1 font-semibold text-white no-underline transition hover:bg-white/20 text-xs'}`}
          onClick={sessionData ? () => signOut() : () => signIn()}
        >
          {sessionData ? "Sign out" : "Sign in to get full access"}
        </button>}
        {autoLoginStatus === 'loading' && <LoadingSpinner/> }
      </div>
    </>
  );
};
