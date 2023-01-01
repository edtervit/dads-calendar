import {trpc} from "../utils/trpc";
import {type NextPage} from "next";
import {Auth} from ".";
import {useEffect} from "react";
import {useRouter} from "next/router";


const Users: NextPage = () => {
  const router = useRouter();

  //if loading the users errors (because of invalid auth, etc) then redirect to home page
  const {data: users, isError } = trpc.users.getAllUsers.useQuery(undefined, {retry: false})

  //useEffect to watch for error and redirect to home page
  useEffect(() => {
    if (isError) {
      router.push("/");
    }
  }, [isError, router])

  return (
    <>
      <main className="flex min-h-screen flex-col items-center  bg-gradient-to-b from-[#6d0202] to-[#2c1515] text-white">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 pt-16 pb-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(0,100%,70%)]"> Ned&apos;s </span>Racing Calendar
          </h1>
          <Auth />
        </div>
        {users && <h2 className='text-2xl'>Users</h2>}
        {users && users.map((user) => (
          <div key={user.email} className='mt-2'>
            {user.email} - {user.emailVerified?.toLocaleString()}
          </div>
        ))}
      </main>
    </>
  );
};

export default Users;