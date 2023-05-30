import { useUser } from "@clerk/nextjs";
import { NextPage } from "next";


  const ProfilePage: NextPage = () => {
    const user = useUser();
    return (
      <>
        <div>{user.user?.username}</div>
      </>
    );
  };
  
  export default ProfilePage;
  
