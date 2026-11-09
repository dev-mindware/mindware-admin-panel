import { NextRequest, NextResponse } from "next/server";

const FORWARDED_REQUEST_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "x-store-id",
  "x-tenant-id",
  "idempotency-key",
] as const;

const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
] as const;

function getBackendBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://mindgest.mindware-vps.cloud/api";
  return raw.replace(/\/+$/, "");
}

async function handleProxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const targetPath = (path || []).join("/");
  const search = req.nextUrl.search || "";
  const targetUrl = `${getBackendBaseUrl()}/${targetPath}${search}`;

  const upstreamHeaders = new Headers();

  for (const headerName of FORWARDED_REQUEST_HEADERS) {
    const val = req.headers.get(headerName);
    if (val) {
      upstreamHeaders.set(headerName, val);
    }
  }

  // Inject server-only API_KEY (never exposed to browser)
  const serverApiKey = process.env.API_KEY;
  if (serverApiKey) {
    upstreamHeaders.set("x-api-key", serverApiKey);
  }

  const method = req.method.toUpperCase();
  let body: ArrayBuffer | undefined;

  if (method !== "GET" && method !== "HEAD") {
    const buffer = await req.arrayBuffer();
    if (buffer.byteLength > 0) {
      body = buffer;
    }
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers: upstreamHeaders,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    for (const headerName of FORWARDED_RESPONSE_HEADERS) {
      const val = upstreamResponse.headers.get(headerName);
      if (val) {
        responseHeaders.set(headerName, val);
      }
    }

    if (upstreamResponse.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: responseHeaders,
      });
    }

    const responseBuffer = await upstreamResponse.arrayBuffer();
    return new NextResponse(responseBuffer, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("🚨 [Admin API Proxy] Erro ao comunicar com o backend:", error);
    return NextResponse.json(
      {
        message: "Serviço temporariamente indisponível",
        code: "BACKEND_UNAVAILABLE",
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxyRequest;
export const POST = handleProxyRequest;
export const PUT = handleProxyRequest;
export const PATCH = handleProxyRequest;
export const DELETE = handleProxyRequest;
export const OPTIONS = handleProxyRequest;
export const HEAD = handleProxyRequest;

