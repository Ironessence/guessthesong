import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const categoryYearRanges: { [key: string]: [number, number] } = {
  '70s': [1970, 1979],
  '80s': [1980, 1989],
  '90s': [1990, 1999],
  '00s': [2000, 2009],
  '2010s': [2010, 2019],
  'recent': [2020, new Date().getFullYear()],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || !categoryYearRanges[category]) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  try {
    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body['access_token']);

    const [startYear, endYear] = categoryYearRanges[category];
    const randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    
    const searchResponse = await spotifyApi.searchTracks(`year:${randomYear}`, {
      limit: 50,
      offset: Math.floor(Math.random() * 1000), // Random offset to get different results each time
    });

    if (!searchResponse.body || !searchResponse.body.tracks) {
      throw new Error('No tracks found for the given year');
    }

    if (searchResponse.body.tracks.items.length === 0) {
      throw new Error('No tracks found for the given year');
    }

    const randomTrack = searchResponse.body.tracks.items[Math.floor(Math.random() * searchResponse.body.tracks.items.length)];

    return NextResponse.json({
      id: randomTrack.id,
      title: randomTrack.name,
      artist: randomTrack.artists[0].name,
      preview: randomTrack.preview_url,
      artwork: randomTrack.album.images[0].url,
    });
  } catch (error) {
    console.error('Error fetching random song:', error);
    return NextResponse.json({ error: 'Error fetching random song' }, { status: 500 });
  }
}