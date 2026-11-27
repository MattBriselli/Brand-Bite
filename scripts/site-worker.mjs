export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.eatbrandbite.com") {
      url.hostname = "eatbrandbite.com";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  }
};
