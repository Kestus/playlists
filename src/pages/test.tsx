import { type NextPage } from "next";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";

const Test: NextPage = () => {
  // const { data, isLoading } = api.spotify.getAccessToken.useQuery();
  // if (isLoading) {
  //   return <Loading />;
  // }
  
  const { mutate: test } = api.spotify.getAccessToken.useMutation();

  return (
    <section>
      <Navbar />
      <div>
        <button onClick={() => test()} className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Yep
        </button>
      </div>
    </section>
  );
};

export default Test;
