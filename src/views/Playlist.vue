<template>
  <div class="playlist" v-if="playlist">
    <div class="playlist-header">
      <h2>{{ playlist.name }}</h2>
      <p>{{ playlist.description }}</p>
    </div>

    <div class="video-player-container" v-if="currentVideo">
      <div class="player-wrapper">
        <iframe
          v-if="currentVideo.source === 'youtube'"
          :src="getYouTubeEmbedUrl(currentVideo.url)"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <iframe
          v-else-if="currentVideo.source === 'vimeo'"
          :src="getVimeoEmbedUrl(currentVideo.url)"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        ></iframe>
        <video
          v-else
          :src="currentVideo.url"
          controls
          class="video-player"
        ></video>
      </div>
      <h3>{{ currentVideo.title }}</h3>
    </div>

    <div class="playlist-videos">
      <div
        v-for="video in playlist.videos"
        :key="video.id"
        class="video-item"
        :class="{ active: currentVideo && currentVideo.id === video.id }"
        @click="playVideo(video)"
      >
        <div class="video-info">
          <h4>{{ video.title }}</h4>
          <span class="source-badge">{{ video.source }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface Video {
  id: string;
  title: string;
  url: string;
  source?: 'youtube' | 'vimeo' | 'other';
  cover?: string;
  note?: string;
  tags?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  videos: Video[];
}

export default {
  name: 'Playlist',
  data() {
    return {
      playlist: null as Playlist | null,
      currentVideo: null as Video | null
    };
  },
  methods: {
    getYouTubeEmbedUrl(url: string): string {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      return `https://www.youtube.com/embed/${videoId}`;
    },
    getVimeoEmbedUrl(url: string): string {
      const videoId = url.match(/vimeo\.com\/(\d+)/i)?.[1];
      return `https://player.vimeo.com/video/${videoId}`;
    },
    playVideo(video: Video): void {
      this.currentVideo = video;
    }
  },
  created() {
    // Get playlists from localStorage
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]') as Playlist[];
    this.playlist = playlists.find(p => p.id === this.$route.params.id) || null;
    
    if (this.playlist && this.playlist.videos.length > 0) {
      this.currentVideo = this.playlist.videos[0];
    }
  }
};
</script>

<style scoped>
.playlist {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.playlist-header {
  margin-bottom: 20px;
}

.video-player-container {
  margin-bottom: 20px;
}

.player-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  background: #000;
  border-radius: 8px;
  margin-bottom: 10px;
}

.player-wrapper iframe,
.player-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.playlist-videos {
  display: grid;
  gap: 10px;
}

.video-item {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.video-item:hover {
  background: #e0e0e0;
}

.video-item.active {
  background: #2196F3;
  color: white;
}

.video-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.source-badge {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.8em;
}

.active .source-badge {
  background: rgba(255, 255, 255, 0.2);
}
</style>
