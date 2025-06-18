import { serve } from "std/http/server.ts";

const PRIVACY_POLICY_PATH = "./privacy-policy.md";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Serve privacy policy
  if (url.pathname === "/privacy") {
    try {
      const content = await Deno.readTextFile(PRIVACY_POLICY_PATH);
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>BrutalSales Privacy Policy</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
              }
              h1 { color: #D97706; }
              h2 { color: #F59E0B; margin-top: 30px; }
              a { color: #D97706; }
              pre { 
                background: #f4f4f4;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>`,
        {
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        }
      );
    } catch (error) {
      console.error("Error reading privacy policy:", error);
      return new Response("Privacy policy not found", { status: 404 });
    }
  }

  // Serve terms of service
  if (url.pathname === "/terms") {
    try {
      const content = await Deno.readTextFile("./terms-of-service.md");
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>BrutalSales Terms of Service</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
              }
              h1 { color: #D97706; }
              h2 { color: #F59E0B; margin-top: 30px; }
              a { color: #D97706; }
              pre { 
                background: #f4f4f4;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>`,
        {
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        }
      );
    } catch (error) {
      console.error("Error reading terms of service:", error);
      return new Response("Terms of service not found", { status: 404 });
    }
  }

  return new Response("Not found", { status: 404 });
}

console.log("Server starting on http://localhost:8000");
await serve(handler, { port: 8000 }); 