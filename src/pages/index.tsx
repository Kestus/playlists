import {
  SignIn,
  SignInButton,
  // SignedOut,
  UserButton,
  UserProfile,
  useOrganizationList,
  useUser,
} from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

// import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();
  return (
    <>
      <Head>
        <title>Main</title>
      </Head>
      <header className="sticky top-0 flex gap-4 bg-green-200 p-2">
        <div className="text-slate-800">
          <Link href={`/`}></Link>
        </div>
        <div className="text-slate-800">
          <Link href={`/`}></Link>
        </div>
        <div className="text-slate-800">
          <Link href={`/`}></Link>
        </div>
        <div className="ml-auto flex">
          {!user.isSignedIn && <SignInButton />}
          {user.isSignedIn && (
            <>
              {user.user.username && (
                <Link href={`/profile/${user.user.username}`}>
                  <span className="mr-2 text-center">{`${user.user.username}`}</span>
                </Link>
              )}
              <UserButton />
            </>
          )}
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50">
        <div></div>
      </main>
    </>
  );
};

export default Home;
