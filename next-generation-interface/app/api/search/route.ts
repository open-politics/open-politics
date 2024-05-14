// app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = 'https://api.tavily.com/search';

async function searchData(query: string | null) {
  if (!query) {
    return [];
  }

  try {
    const response = await axios.get(TAVILY_API_URL, {
      params: {
        q: query,
        api_key: TAVILY_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  if (typeof window !== 'undefined') {
    // Client-side rendering
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    // Perform search logic here and return the response
    const results = await searchData(query);
    return NextResponse.json(results);
  } else {
    // Server-side rendering
    return NextResponse.json({ message: 'Search is only available on the client-side' });
  }
}
