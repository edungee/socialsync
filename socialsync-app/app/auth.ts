import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { D1Adapter } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Build the Auth.js config **after** we have access to Cloudflare's runtime `env` bindings.
const getAuth = async () => {
  const { env } = await getCloudflareContext({ async: true });

  const googleProvider = Google({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  });

  const ytBase = Google({
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
  });

  const youtubeProvider = {
    ...ytBase,
    id: "google-youtube",
    name: "YouTube",
    options: {
      ...ytBase.options,
      id: "google-youtube",
      name: "YouTube",
    },
  } as typeof ytBase;

  const linkedinProvider = LinkedIn({
    clientId: env.LINKEDIN_CLIENT_ID,
    clientSecret: env.LINKEDIN_CLIENT_SECRET,
    authorization: {
      params: {
        scope: "r_liteprofile r_emailaddress",
      },
    },
  });

  const providersList = [googleProvider, youtubeProvider, linkedinProvider];

  const authConfig = NextAuth({
    secret: env.AUTH_SECRET,
    debug: true,
    session: {
      strategy: "jwt",
    },
    adapter: D1Adapter(env.DB),
    providers: providersList,
    trustHost: true,
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
    events: {
      async signIn() {
        console.log("providerIds", ["google", "google-youtube", "linkedin"]);
      },
    },
  });

  // provider list logged for debug
  // eslint-disable-next-line no-console
  console.log("AUTH providers", providersList.map((p) => p.id));
  return authConfig;
};

export const { handlers, auth, signIn, signOut } = await getAuth(); 