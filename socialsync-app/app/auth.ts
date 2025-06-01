import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { D1Adapter } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Build the Auth.js config **after** we have access to Cloudflare's runtime `env` bindings.
const getAuth = async () => {
  const { env } = await getCloudflareContext({ async: true });

  return NextAuth({
    secret: env.AUTH_SECRET,
    session: {
      strategy: "jwt",
    },
    adapter: D1Adapter(env.DB),
    providers: [
      // Primary login
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      // Alias provider used solely for YouTube channel linking (extra scopes)
      Google({
        id: "youtube",
        name: "YouTube",
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            scope:
              "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly",
            access_type: "offline",
            prompt: "consent",
          },
        },
      }),
    ],
    callbacks: {
      session({ session, token }) {
        if (session.user) {
          // Ensure user id is exposed to the client
          // @ts-expect-error - id is not in the default type
          session.user.id = token.sub;
        }
        return session;
      },
    },
  });
};

export const { handlers, auth, signIn, signOut } = await getAuth(); 