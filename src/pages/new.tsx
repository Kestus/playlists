import type { NextPage } from "next";
import NewPlaylistForm from "~/components/forms/newPlaylist";
import Navbar from "~/components/navbar";


const NewPlaylistPage: NextPage = () => {
  return (
    <section>
      <Navbar />
      <div className="flex flex-col items-center gap-10 pt-40">
        <NewPlaylistForm />
      </div>
    </section>
  )
}

export default NewPlaylistPage