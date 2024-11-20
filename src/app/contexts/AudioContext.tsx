// src/app/contexts/AudioContext.tsx
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
}

type AudioAction = 
  | { type: 'PLAY_MIX'; payload: Mix }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'STOP' }
  | { type: 'SEEK'; payload: number }
  | { type: 'CLEAR_SEEK' };

const initialState: AudioState = {
  currentMix: null,
  isPlaying: false,
};

const AudioContext = createContext<{
  state: AudioState;
  dispatch: React.Dispatch<AudioAction>;
} | null>(null);

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'PLAY_MIX':
      return {
        ...state,
        currentMix: action.payload,
        isPlaying: true,
      };
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