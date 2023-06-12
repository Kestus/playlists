import Head from "next/head";

const Loading = () => {
  return (
    <>
      <Head>
        <title>Loading...</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50">
        Loading...
      </main>
    </>
  );
};

export default Loading;
