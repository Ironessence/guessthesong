'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CategorySelector, { Category } from './CategorySelection';
import { cleanSongTitle } from '../utils/cleanSongTitle';

interface Song {
  id: string;
  title: string;
  artist: string;
  preview: string;
  artwork: string;
}

const GuessSong: React.FC = () => {
  const [song, setSong] = useState<Song | null>(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [playDuration, setPlayDuration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log('SONG:', song);
  }, [song])

  useEffect(() => {
    // Load the category from local storage when the component mounts
    const storedCategory = localStorage.getItem('selectedCategory') as Category | null;
    if (storedCategory) {
      setSelectedCategory(storedCategory);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // Save the category to local storage whenever it changes
      localStorage.setItem('selectedCategory', selectedCategory);
      fetchRandomSong();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setScore(0); // Reset score when changing category
    setWrongGuesses(0);
    setPlayDuration(1);
    setNotification(null);
  };

  const fetchRandomSong = async () => {
    if (!selectedCategory) return;

    try {
      const response = await axios.get<Song>(`/api/random-song?category=${selectedCategory}`);
      setSong(response.data);
      setPlayDuration(1);
      setWrongGuesses(0);
      setError(null);
      setGuess('');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Error fetching random song:', error);
      setError('Failed to fetch a new song. Please try again.');
    }
  };

  const handleGuess = () => {
    if (!song) return;

    const cleanedSongTitle = cleanSongTitle(song.title);
    const cleanedGuess = cleanSongTitle(guess);

    if (cleanedGuess.toLowerCase() === cleanedSongTitle.toLowerCase()) {
      setScore(score + 1);
      setGuess('');
      setNotification("Correct!");
      setTimeout(() => {
        fetchRandomSong();
      }, 3000);
    } else {
      setPlayDuration(Math.min(playDuration * 2, 16));
      setGuess('');
      setWrongGuesses(wrongGuesses + 1);
      
      if (wrongGuesses === 3) {
        setNotification(`Wrong. Correct answer was: ${cleanedSongTitle}`);
        setTimeout(() => {
          fetchRandomSong();
        }, 3000);
      }
    }
  };

  const playSnippet = () => {
    if (audioRef.current && song) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }, playDuration * 1000);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Guess the Song</h1>
      <CategorySelector
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      <p className="text-xl mb-4">Score: {score}</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {notification && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
          <p>{notification}</p>
        </div>
      )}
      {song && (
        <div className="space-y-4">
          <audio ref={audioRef} src={song.preview} />
          <button
            onClick={playSnippet}
            disabled={isPlaying}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 mr-2"
          >
            {isPlaying ? `Playing... (${playDuration}s)` : `Play Snippet (${playDuration}s)`}
          </button>
          <button
            onClick={fetchRandomSong}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Get New Song
          </button>
          <div>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter song name"
              className="border p-2 mr-2 text-black"
            />
            <button
              onClick={handleGuess}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Submit Guess
            </button>
          </div>
          <img src={song.artwork} alt="Album artwork" className="w-40 h-40 object-cover" />
        </div>
      )}
    </div>
  );
};

export default GuessSong;