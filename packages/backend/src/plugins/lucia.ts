import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { GitHub, Google } from "arctic";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Lucia } from "lucia";
import pg from "pg";

let lucia: Lucia;

async function luciaAuth(fastify: FastifyInstance) {
  const pool = new pg.Pool({
    connectionString: fastify.config.DATABASE_URL,
  });

  const adapter = new NodePostgresAdapter(pool, {
    user: "auth.auth_user",
    session: "auth.user_session",
  });

  lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username,
        email: attributes.email,
      };
    },
  });

  const github = new GitHub(
    fastify.config.DEV_GITHUB_CLIENT_ID,
    fastify.config.DEV_GITHUB_CLIENT_SECRET,
  );
  const google = new Google(
    fastify.config.DEV_GOOGLE_CLIENT_ID,
    fastify.config.DEV_GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/v1/account/login/google/callback",
  );

  fastify.decorate("lucia", {
    luciaInstance: lucia,
    oAuth: {
      github,
      google,
    },
  });
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      username: string;
      email: string;
    };
  }
}

export default fastifyPlugin(luciaAuth);
