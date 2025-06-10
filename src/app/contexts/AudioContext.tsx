'use client';

import React, { createContext, useContext, useReducer } from 'react';

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