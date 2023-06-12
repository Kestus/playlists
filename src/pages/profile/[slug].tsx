import { type NextPage } from "next";
import { useRouter } from "next/router";
import ErrorPage from "~/components/error";

import Navbar from "~/components/navbar";
import Loading from "~/components/placeholders/loading";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { slug } = useRouter().query;
  if (slug == undefined) {
    return <ErrorPage />;
  }
  const username = slug as string;
  const { data, isLoading, isError, error } =
    api.profile.getUserByUsername.useQuery({ username: username });

  if (isLoading) {
    return <Loading />;
  }
  if (isError) {
    return <ErrorPage code={error.data?.httpStatus} message={error.message} />;
  }

  return (
    <>
      <Navbar />
      <main>
        <div>{data.username}</div>
      </main>
    </>
  );
};

export default ProfilePage;
