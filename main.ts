import { serve } from "https://deno.land/std@0.145.0/http/mod.ts";

const OWNER = Deno.env.get("OWNER");

serve(async (req) => {
  if (new URL(req.url).pathname === "/") {
    return Response.redirect(`https://github.com/dcdunkan/dcdunkan.deno.dev`);
  }

  const splits = req.url.split("/");
  const repo = splits[3]?.split("@")[0];
  const version = splits[3]?.split("@")[1];
  const file = splits.slice(4).join("/");

  if (!version) {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/tags`,
    );
    if (!res.ok) new Response("Not found", { status: 400 });

    const tags = await res.json() as { name: string }[];

    if (tags?.[0]?.name) {
      return Response.redirect(
        `https://${splits[2]}/${repo}@${tags[0].name}/${file}`,
      );
    }

    const res_ = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`);
    const repo_ = await res_.json();

    if (repo_.default_branch) {
      return Response.redirect(
        `https://${splits[2]}/${repo}@${repo_.default_branch}/${file}`,
      );
    }

    return new Response("Not found", { status: 400 });
  }

  const url =
    `https://raw.githubusercontent.com/${OWNER}/${repo}/${version}/${file}`;
  const res = await fetch(url);
  const text = await res.text();

  return new Response(text, { status: 200 });
});
