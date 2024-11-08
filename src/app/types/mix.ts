// types/mix.ts

export interface Artist {
    id: string;
    name: string;
    avatar_url: string | null;
  }
  
  export interface MixArtist {
    artists: Artist;
  }
  
  export interface Mix {
    id: string;
    title: string;
    genre: string | null;
    cover_url: string | null;
    play_count: number;
    created_at: string;
    mix_artists: MixArtist[];
  }
  
  export interface MixCardProps {
    mix: Mix;
  }