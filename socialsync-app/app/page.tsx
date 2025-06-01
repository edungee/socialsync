import { auth, signIn, signOut } from "./auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
      {session ? (
        <>
          <p className="text-lg font-semibold">Signed in as {session.user?.email}</p>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button type="submit" className="border rounded px-4 py-2">Sign out</button>
          </form>
        </>
      ) : (
        <form
          action={async () => {
            'use server';
            await signIn('google');
          }}
        >
          <button type="submit" className="border rounded px-4 py-2">Sign in with Google</button>
        </form>
      )}
    </main>
  );
}
