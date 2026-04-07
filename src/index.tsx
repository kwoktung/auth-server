import { Hono } from "hono";
import { cors } from "hono/cors";
import { renderer } from "./renderer";
import { createAuth } from "./auth-utils";
import { HTTPException } from "hono/http-exception";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(renderer);

app.use(
  "*",
  cors({
    origin: (c) => c,
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS", "DELETE", "PUT", "PATCH"],
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

app.get("/", (c) => {
  return c.text("Hello!");
});

app.get("/me", async (c) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.text("Unauthorized", 401);
  }
  return c.text(`Hello, ${session.user.email}`);
});

app.get("/login", async (c) => {
  const auth = createAuth(c.env);
  const callbackURL = c.req.query("callbackURL") ?? "/";
  const response = await auth.api.signInSocial({
    body: { provider: "google", callbackURL },
    asResponse: true,
  });
  const { url } = await response.json<{ url: string; redirect: boolean }>();
  if (!url) {
    throw new HTTPException(401);
  }
  const redirect = c.redirect(url);
  for (const cookie of response.headers.getSetCookie()) {
    redirect.headers.append("set-cookie", cookie);
  }
  return redirect;
});

export default app;
