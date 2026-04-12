(function () {
  function updateNowPlayingHint() {
    const target = document.getElementById("player-status");
    if (!target) return;

    const player = window._PlayerCore;
    if (!player || !player.SongIdMap) return window.setTimeout(updateNowPlayingHint, 200);

    const current = player.SongIdMap[player.CurrentSongId];
    target.textContent = current ? current.name : "Playlist ready";

    if (player.e) {
      player.e.addEventListener("play", () => {
        const song = player.SongIdMap[player.CurrentSongId];
        target.textContent = song ? song.name : "Playing";
      });
      player.e.addEventListener("pause", () => {
        const song = player.SongIdMap[player.CurrentSongId];
        target.textContent = song ? `${song.name} / paused` : "Paused";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", updateNowPlayingHint);
})();
