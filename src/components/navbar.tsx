import { SignIn } from "@clerk/clerk-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import NavbarSkeleton from "./placeholders/navbarSkeleton";

const Navbar = () => {
  const user = useUser();
  if (!user.isLoaded) {
    return <NavbarSkeleton />;
  }

  return (
    <>
      <header className="sticky top-0 flex h-12 flex-row items-center gap-4 bg-green-200 px-2">
        <Link href={`/latest`} className="text-slate-800">
          Latest
        </Link>
        <Link href={`/new`} className="text-slate-800">
          Add new playlist
        </Link>
        <div className="ml-auto flex">
          {!user.isSignedIn && <SignInButton />}
          {user.isSignedIn && (
            <>
              {user.user.username && (
                <Link
                  href={`/profile/${user.user.username}`}
                  className="flex items-center"
                >
                  <span className="mr-2">{`${user.user.username}`}</span>
                </Link>
              )}
              <UserButton />
            </>
          )}
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      </header>
    </>
  );
};

export default Navbar;
