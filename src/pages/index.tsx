// import {
//   SignIn,
//   SignInButton,
//   SignedOut,
//   UserButton,
//   useUser,
//   useOrganization,
// } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

// import { api } from "~/utils/api";
import Navbar from "~/components/navbar";

const Home: NextPage = () => {
  return (
    <section>
      <Head>
        <title>Main</title>
      </Head>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50">
        <div>home</div>
      </main>
    </section>
  );
};

export default Home;
