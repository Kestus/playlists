import type { NextPage } from "next";
import Navbar from "~/components/navbar";
import NewPlaylistForm from "~/components/newPlaylistForm";


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