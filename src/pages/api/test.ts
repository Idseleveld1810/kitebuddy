import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, request }) => {
  console.log('🔍 GET API called with URL:', url.toString());
  console.log('🔍 Request URL:', request.url);
  
  // Try multiple approaches to get query parameters
  const requestUrl = new URL(request.url);
  const requestParams = Object.fromEntries(requestUrl.searchParams.entries());
  
  const { searchParams } = new URL(url);
  const urlParams = Object.fromEntries(searchParams.entries());
  
  // Try parsing from the raw URL string
  const rawUrl = request.url;
  const rawUrlObj = new URL(rawUrl);
  const rawParams = Object.fromEntries(rawUrlObj.searchParams.entries());
  
  console.log('🔍 Request params:', requestParams);
  console.log('🔍 URL params:', urlParams);
  console.log('🔍 Raw params:', rawParams);
  
  return new Response(JSON.stringify({
    message: 'GET API is working!',
    requestParams,
    urlParams,
    rawParams,
    requestUrl: request.url,
    url: url.toString(),
    rawUrl
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  console.log('🔍 POST API called');
  
  const requestUrl = new URL(request.url);
  const requestParams = Object.fromEntries(requestUrl.searchParams.entries());
  
  console.log('🔍 POST Request params:', requestParams);
  
  return new Response(JSON.stringify({
    message: 'POST API is working!',
    requestParams,
    requestUrl: request.url
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
