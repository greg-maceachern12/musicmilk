# MusicMilk

MusicMilk is a web application for uploading, sharing, and listening to music mixes. It provides a platform for DJs and music enthusiasts to share their creations with the world.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Authentication & Database:** [Supabase](https://supabase.io/)
- **File Storage:** [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)
- **Audio Visualization:** [wavesurfer.js](https://wavesurfer.xyz/)
- **Deployment:** [Netlify](https://www.netlify.com/)

## Features

- **User Authentication:** Secure sign-up and sign-in functionality using Supabase Auth.
- **Profile Management:** Users can manage their profiles.
- **Mix Uploading:** Upload music mixes, which are stored in Azure Blob Storage.
- **Music Playback:** Stream and listen to mixes with a waveform visualization.
- **Feed:** Discover new mixes from other users.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v20 or later)
- npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/musicmilk.git
    ```
2.  Navigate to the project directory
    ```sh
    cd musicmilk
    ```
3.  Install NPM packages
    ```sh
    npm install
    ```
4.  Set up your environment variables. Create a `.env.local` file in the root of the project and add the following variables. You will need to create a Supabase project and an Azure Storage account to get these values.

    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
    AZURE_STORAGE_CONTAINER_NAME=your_azure_storage_container_name
    ```

5.  Run the development server
    ```sh
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is deployed on [Netlify](https://www.netlify.com/). The deployment configuration can be found in the `netlify.toml` file. Any push to the `main` branch will trigger a new deployment.
