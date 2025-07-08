'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  audio_url: string;
  cover_url: string | null;
}

interface AudioState {
  currentMix: Mix | null;
  isPlaying: boolean;
  seekTime?: number;
  currentTime: number;
  shuffleEnabled: boolean;
  playlist: Mix[];
  originalPlaylist: Mix[];
  currentIndex: number;
}

type AudioAction = 
  | { type: 'PLAY_MIX'; payload: Mix }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'STOP' }
  | { type: 'SEEK'; payload: number }
  | { type: 'CLEAR_SEEK' }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'SET_PLAYLIST'; payload: { mixes: Mix[], startIndex: number } }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TRACK_ENDED' };

const initialState: AudioState = {
  currentMix: null,
  isPlaying: false,
  currentTime: 0,
  shuffleEnabled: false,
  playlist: [],
  originalPlaylist: [],
  currentIndex: -1,
};

const AudioContext = createContext<{
  state: AudioState;
  dispatch: React.Dispatch<AudioAction>;
} | null>(null);

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Media Session Integration
function updateMediaSession(state: AudioState) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

  const { currentMix, isPlaying, currentTime } = state;

  if (currentMix) {
    // Update metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentMix.title,
      artist: currentMix.artist || 'Unknown Artist',
      album: currentMix.genre || 'Mix',
      artwork: [
        { src: currentMix.cover_url || '/default-cover.png', sizes: '96x96', type: 'image/png' },
        { src: currentMix.cover_url || '/default-cover.png', sizes: '128x128', type: 'image/png' },
        { src: currentMix.cover_url || '/default-cover.png', sizes: '192x192', type: 'image/png' },
        { src: currentMix.cover_url || '/default-cover.png', sizes: '256x256', type: 'image/png' },
        { src: currentMix.cover_url || '/default-cover.png', sizes: '384x384', type: 'image/png' },
        { src: currentMix.cover_url || '/default-cover.png', sizes: '512x512', type: 'image/png' },
      ]
    });

    // Update playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Update position state if available
    if (currentTime !== undefined) {
      navigator.mediaSession.setPositionState({
        duration: NaN, // Will be set by audio element
        playbackRate: 1.0,
        position: currentTime
      });
    }
  } else {
    // Clear metadata when no track is playing
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
  }
}

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'PLAY_MIX':
      // If playing a mix that's not in the current playlist, create a single-item playlist
      const mixIndex = state.playlist.findIndex(mix => mix.id === action.payload.id);
      if (mixIndex === -1) {
        const newPlaylist = [action.payload];
        return {
          ...state,
          currentMix: action.payload,
          isPlaying: true,
          playlist: newPlaylist,
          originalPlaylist: newPlaylist,
          currentIndex: 0,
          shuffleEnabled: false,
        };
      } else {
        return {
          ...state,
          currentMix: action.payload,
          isPlaying: true,
          currentIndex: mixIndex,
        };
      }
    case 'TOGGLE_PLAY':
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    case 'STOP':
      return {
        ...state,
        isPlaying: false,
      };
    case 'SEEK':
      return {
        ...state,
        seekTime: action.payload,
      };
    case 'CLEAR_SEEK':
      return {
        ...state,
        seekTime: undefined,
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };
    case 'SET_PLAYLIST':
      const { mixes, startIndex } = action.payload;
      return {
        ...state,
        playlist: mixes,
        originalPlaylist: mixes,
        currentIndex: startIndex,
        currentMix: mixes[startIndex] || null,
        isPlaying: true,
        shuffleEnabled: false,
      };
    case 'NEXT_TRACK':
      if (state.currentIndex < state.playlist.length - 1) {
        const nextIndex = state.currentIndex + 1;
        return {
          ...state,
          currentIndex: nextIndex,
          currentMix: state.playlist[nextIndex],
          isPlaying: true,
        };
      }
      return state;
    case 'PREVIOUS_TRACK':
      if (state.currentIndex > 0) {
        const prevIndex = state.currentIndex - 1;
        return {
          ...state,
          currentIndex: prevIndex,
          currentMix: state.playlist[prevIndex],
          isPlaying: true,
        };
      }
      return state;
    case 'TOGGLE_SHUFFLE':
      const newShuffleState = !state.shuffleEnabled;
      if (newShuffleState) {
        // Shuffle is being enabled
        const currentTrack = state.playlist[state.currentIndex];
        const upcomingTracks = state.playlist.slice(state.currentIndex + 1);
        const pastTracks = state.playlist.slice(0, state.currentIndex);
        
        const shuffledUpcoming = shuffleArray(upcomingTracks);
        
        const newPlaylist = [...pastTracks, currentTrack, ...shuffledUpcoming];
        
        return {
          ...state,
          shuffleEnabled: true,
          playlist: newPlaylist,
        };
      } else {
        // Shuffle is being disabled, revert to original order
        const currentMixId = state.currentMix?.id;
        const newCurrentIndex = state.originalPlaylist.findIndex(mix => mix.id === currentMixId);
        return {
          ...state,
          shuffleEnabled: false,
          playlist: state.originalPlaylist,
          currentIndex: newCurrentIndex >= 0 ? newCurrentIndex : state.currentIndex,
        };
      }
    case 'TRACK_ENDED':
      if (state.currentIndex < state.playlist.length - 1) {
        const nextIndex = state.currentIndex + 1;
        return {
          ...state,
          currentIndex: nextIndex,
          currentMix: state.playlist[nextIndex],
          isPlaying: true,
        };
      }
      return {
        ...state,
        isPlaying: false,
      };
    default:
      return state;
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState);

  // Set up MediaSession handlers
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const handlePlay = () => {
      dispatch({ type: 'TOGGLE_PLAY' });
    };

    const handlePause = () => {
      dispatch({ type: 'STOP' });
    };

    const handlePreviousTrack = () => {
      dispatch({ type: 'PREVIOUS_TRACK' });
    };

    const handleNextTrack = () => {
      dispatch({ type: 'NEXT_TRACK' });
    };

    const handleSeekTo = (details: MediaSessionActionDetails) => {
      if (details.seekTime !== undefined) {
        dispatch({ type: 'SEEK', payload: details.seekTime });
      }
    };

    // Set up media session action handlers
    navigator.mediaSession.setActionHandler('play', handlePlay);
    navigator.mediaSession.setActionHandler('pause', handlePause);
    navigator.mediaSession.setActionHandler('previoustrack', handlePreviousTrack);
    navigator.mediaSession.setActionHandler('nexttrack', handleNextTrack);
    navigator.mediaSession.setActionHandler('seekto', handleSeekTo);

    // Try to set up additional handlers that might be supported
    try {
      navigator.mediaSession.setActionHandler('stop', handlePause);
      navigator.mediaSession.setActionHandler('seekbackward', (details: MediaSessionActionDetails) => {
        dispatch({ type: 'SEEK', payload: Math.max(0, state.currentTime - (details.seekOffset || 10)) });
      });
      navigator.mediaSession.setActionHandler('seekforward', (details: MediaSessionActionDetails) => {
        dispatch({ type: 'SEEK', payload: state.currentTime + (details.seekOffset || 10) });
      });
    } catch {
      // Some browsers might not support these handlers
      console.log('Some media session handlers not supported');
    }

    // Cleanup function
    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
        navigator.mediaSession.setActionHandler('stop', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [state]);

  // Update MediaSession whenever the state changes
  useEffect(() => {
    updateMediaSession(state);
  }, [state.currentMix, state.isPlaying, state.currentTime, state.playlist, state.currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AudioContext.Provider value={{ state, dispatch }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}