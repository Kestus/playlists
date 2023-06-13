import { type NextPage } from "next";
import Navbar from "~/components/navbar";


const Test: NextPage = () => {
  // const { data, isLoading } = api.spotify.getAccessToken.useQuery();
  // if (isLoading) {
  //   return <Loading />;
  // }

  // const { mutate, data } = api.spotify.getAccessToken.useMutation();

  return (
    <section>
      <Navbar />
      <div className="flex flex-col items-center gap-10 pt-40">
        <button className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
          yep
        </button>
        <br />
        {/* {data && (
          <span className="text rounded-md border-4 border-emerald-400 bg-indigo-200 p-10 text-lg text-slate-700">
            {data}
          </span>
        )} */}
      </div>
    </section>
  );
};

export default Test;
