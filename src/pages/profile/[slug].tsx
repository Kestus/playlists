import { type NextPage } from "next";
import { useRouter } from "next/router";
import Custom404page from "~/components/error/404";

import Navbar from "~/components/navbar";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { slug } = useRouter().query;
  if (slug == undefined) {
    return <></>;
  }
  const username = slug as string;
  const { data, isLoading, isError, error } =
    api.profile.getUserByUsername.useQuery({ username: username });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return (
      <div>
        <Custom404page />
        <span>{error.message}</span>
      </div>
    );
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
