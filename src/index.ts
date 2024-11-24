import { Hono } from "hono";
import { compress } from "hono/compress";
import { replaceImagesRandom } from "./images";

const app = new Hono();
app.use(compress());

const originalUrl = "https://tagesschau.de";
const imageCdns = [
  "https://images.tagesschau.de",
  "https://images.sportschau.de",
];

app.get("*", async (c) => {
  const url = new URL(originalUrl);
  url.pathname = c.req.path;

  const response = await fetch(url);

  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  const contentType = headers.get("content-type");

  if (contentType && contentType.startsWith("text/html")) {
    const html = await response.text();
    headers.set("Cache-Control", "max-age=10, stale-while-revalidate=604800");

    return new Response(replaceImagesRandom(imageCdns, html), { headers });
  }

  return new Response(response.body, { headers });
});

export { app };
