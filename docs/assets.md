# Assets and Media

This repository intentionally does not include the production background music files, WAV masters, or the original full-size video.

## Included

- `frontend/Video/Video.optimized.mp4`: optimized background video used by the home page.
- `frontend/Font/MapleMonoNormal-NF-CN-Regular.woff2`: web font used by the site.
- `frontend/Font/LICENSE.txt`: font license notice.

## Not Included

- `frontend/BGM/*.mp3`
- `frontend/BGM/*.wav`
- `frontend/Video/Video.mp4`
- `frontend/Font/*.ttf`

These files were removed to keep the repository lightweight and to avoid publishing media that may have separate copyright terms.

## Adding Your Own Playlist

Create `frontend/BGM/`, place your own licensed audio files in it, then add a script like this before `site.js` in the HTML pages or bundle it into your deployment:

```js
window.ZeroSitePlaylist = [
  { id: 0, name: "Track Name", src: "BGM/track.mp3" }
];
```

The site works without a playlist. The player remains idle when `window.ZeroSitePlaylist` is empty.
