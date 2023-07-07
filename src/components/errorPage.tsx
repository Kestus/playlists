import Navbar from "./navbar";

const ErrorPage = (params: { code?: number; message?: string }) => {
  return (
    <>
      <Navbar />
      <main className="flex h-screen flex-auto flex-col items-center justify-center">
        <span>{params.code || "500"}</span>
        <span>{params.message || "Something went wrong..."}</span>
      </main>
    </>
  );
};

export default ErrorPage;
