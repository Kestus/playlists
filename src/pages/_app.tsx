import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import { Router } from "next/router";
import Loading from "~/components/placeholders/loading";
import React from "react";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [loading, setLoading] = React.useState(false);

  Router.events.on("routeChangeStart", () => {
    setLoading(true);
  });
  Router.events.on("routeChangeComplete", () => {
    setLoading(false);
  });

  return (
    <ClerkProvider {...pageProps}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Head>
            <title>Playlists</title>
            <meta name="description" content="yep" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </>
      )}
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
