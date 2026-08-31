let sharedMedia: HTMLAudioElement | null = null;

/**
 * Reuse a single HTMLAudioElement for the lifetime of the page.
 * Browsers only allow unmuted play() without a user gesture on an element
 * that has already started playback — creating a new <audio> for every
 * track is what broke queue autoplay.
 */
export function getSharedMediaElement(): HTMLAudioElement {
  if (!sharedMedia) {
    sharedMedia = document.createElement('audio');
    sharedMedia.preload = 'auto';
    sharedMedia.crossOrigin = 'anonymous';
    sharedMedia.setAttribute('playsinline', 'true');
    sharedMedia.setAttribute('webkit-playsinline', 'true');
  }
  return sharedMedia;
}
