<template>
  <div class="home">
    <h1>Video Library</h1>
    <div class="import-section">
      <input type="file" accept=".csv" @change="handleFileUpload" />
      <button @click="importCSV" :disabled="!selectedFile">Import CSV</button>
    </div>

    <div v-if="playlists.length" class="content-section">
      <div class="controls">
        <div class="grid-controls">
          <label>Grid Columns:</label>
          <button @click="updateGridColumns(gridColumns - 1)" :disabled="gridColumns <= 1">-</button>
          <span>{{ gridColumns }}</span>
          <button @click="updateGridColumns(gridColumns + 1)" :disabled="gridColumns >= 7">+</button>
        </div>

        <div class="tag-filters">          <span 
            v-for="tag in tagList" 
            :key="tag.name"
            @click="tag.count > 0 && toggleTag(tag.name)"
            :class="[
              'tag', 
              { 
                'active': tag.isActive,
                'disabled': tag.count === 0
              }
            ]"
          >
            {{ tag.name }} ({{ tag.count }})
          </span>
        </div>
      </div>

      <div class="video-grid" :style="{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }">
        <div v-for="video in filteredVideos" :key="video.id" class="video-card" @click="openVideoModal(video)">          <div class="video-cover">
            <img 
              :src="video.cover || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='"
              :alt="video.title"
              @error="handleImageError"
            >
          </div>
          <div class="video-info">
            <span class="video-title">{{ video.title || 'Untitled Video' }}</span>
            <div class="video-meta" v-if="video.created">
              Added: {{ new Date(video.created).toLocaleDateString() }}
            </div>
            <div class="video-tags" v-if="video.tags">
              {{ video.tags }}
            </div>
            <div class="video-note" v-if="video.note">
              {{ video.note }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <div v-if="showVideoModal" class="video-modal" @click.self="closeVideoModal">
      <div class="modal-content">
        <button class="close-button" @click="closeVideoModal">&times;</button>
        <div class="video-player">
          <iframe
            v-if="!embedError"
            :src="selectedVideo?.url"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <div v-else class="embed-error">
            <p>Unable to play this video.</p>
            <button @click="openInNewTab(selectedVideo.url)">Watch on original site</button>
          </div>
        </div>
        <div class="video-details">
          <h2>{{ selectedVideo?.title }}</h2>
          <p v-if="selectedVideo?.note">{{ selectedVideo.note }}</p>
          <div v-if="selectedVideo?.tags" class="modal-tags">
            Tags: {{ selectedVideo.tags }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'Home',  data() {
    return {
      selectedFile: null,
      playlists: [],
      gridColumns: 3,
      selectedTags: [],
      allTags: new Set(),
      showVideoModal: false,
      selectedVideo: null,
      embedError: false,
    };
  },
  computed: {
    filteredVideos() {
      if (!this.playlists.length) return [];
      let videos = this.playlists[0].videos;
      
      if (this.selectedTags.length > 0) {
        videos = videos.filter(video => {
          if (!video.tags) return false;
          const videoTags = video.tags.split(',').map(tag => tag.trim());
          return this.selectedTags.every(tag => videoTags.includes(tag));
        });
      }
      return videos;
    },
      tagCounts() {
      if (!this.playlists.length) return {};
      const counts = {};
      
      // Get all videos that match current tag filters (except the tag being counted)
      const filteredVideos = this.playlists[0].videos.filter(video => {
        if (!video.tags) return false;
        const videoTags = video.tags.split(',').map(tag => tag.trim());
        return this.selectedTags.every(selectedTag => videoTags.includes(selectedTag));
      });

      // Count occurrences of each tag in filtered videos
      filteredVideos.forEach(video => {
        if (!video.tags) return;
        const videoTags = video.tags.split(',').map(tag => tag.trim());
        videoTags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });

      return counts;
    },

    tagList() {
      // Convert tags to array with their counts
      const tagsWithCounts = Array.from(this.allTags).map(tag => ({
        name: tag,
        count: this.tagCounts[tag] || 0,
        isActive: this.selectedTags.includes(tag)
      }));

      // Sort by count (descending) and then alphabetically
      return tagsWithCounts.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
    }
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index === -1) {
        this.selectedTags.push(tag);
      } else {
        this.selectedTags.splice(index, 1);
      }
    },

    updateGridColumns(value) {
      this.gridColumns = Math.max(1, Math.min(7, value));
    },

    openVideoModal(video) {
      this.selectedVideo = video;
      this.showVideoModal = true;
      
      // Check if the video can be embedded
      this.checkEmbedPermission(video.url);
    },

    closeVideoModal() {
      this.showVideoModal = false;
      this.selectedVideo = null;
      this.embedError = false;
    },

    checkEmbedPermission(url) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;

      // Listen for load errors
      iframe.onerror = () => {
        this.embedError = true;
      };

      // Add a timeout to detect X-Frame-Options blocks
      setTimeout(() => {
        try {
          // Try to access iframe content
          const iframeContent = iframe.contentWindow;
          if (!iframeContent) {
            this.embedError = true;
          }
        } catch (e) {
          // If we can't access the content, it's blocked
          this.embedError = true;
        }
        document.body.removeChild(iframe);
      }, 1000);

      document.body.appendChild(iframe);
    },

    openInNewTab(url) {
      window.open(url, '_blank');
      this.closeVideoModal();
    },

    extractTags(videos) {
      this.allTags.clear();
      videos.forEach(video => {
        if (video.tags) {
          video.tags.split(',').forEach(tag => {
            this.allTags.add(tag.trim());
          });
        }
      });
    },

    importCSV() {
      if (!this.selectedFile) return;

      Papa.parse(this.selectedFile, {
        header: true,
        complete: (results) => {          console.log('CSV Results:', results.data); // Add logging to debug
          // Filter out empty or invalid rows
          const validRows = results.data.filter(row => row.id && row.url);
          
          // Create a single playlist with all videos
          this.playlists = [{
            id: 'all',
            name: 'All Videos',
            description: 'All imported videos',
            videos: validRows.map(row => ({
              id: String(row.id),
              title: row.title || 'Untitled Video',
              url: row.url,
              cover: row.cover || '',
              note: row.note || '',
              tags: row.tags || '',
              created: row.created || ''
            }))
          }];          // Extract tags from the videos
          this.extractTags(this.playlists[0].videos);

          // Store the playlists in localStorage for persistence
          localStorage.setItem('playlists', JSON.stringify(this.playlists));
          
          // Log the processed playlists
          console.log('Processed Playlists:', this.playlists);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file');
        }
      });
    },
    handleImageError(event) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
  },
  mounted() {
    // Load any existing playlists from localStorage
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
      this.playlists = JSON.parse(savedPlaylists);
    }
  }
};
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.import-section {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.playlists {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.playlist-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button {
  margin-left: 10px;
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

a {
  display: inline-block;
  margin-top: 10px;
  color: #2196F3;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.video-list {
  margin: 15px 0;
}

.video-list ul {
  list-style: none;
  padding-left: 0;
}

.video-list li {
  margin: 8px 0;
}

.video-list a {
  color: #666;
  text-decoration: none;
}

.video-list a:hover {
  color: #2196F3;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.video-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-2px);
}

.video-cover {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  padding: 15px;
}

.video-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
}

.video-meta {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.video-tags {
  font-size: 14px;
  color: #2196F3;
  margin-bottom: 8px;
}

.video-note {
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.content-section {
  margin-top: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.grid-controls {
  display: flex;
  align-items: center;
}

.grid-controls label {
  margin-right: 10px;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  background: #e0e0e0;
  color: #333;
  padding: 5px 10px;
  border-radius: 16px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.tag.active {
  background: #2196F3;
  color: white;
}

.tag.disabled {
  background: #f0f0f0;
  color: #999;
  cursor: default;
}

.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 800px;
  width: 100%;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.video-player {
  overflow: hidden;
  padding-top: 56.25% /* 16:9 Aspect Ratio */;
  position: relative;
  height: 0;
}

.video-player iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.video-details {
  margin-top: 15px;
}

.video-details h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.video-details p {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.modal-tags {
  font-size: 14px;
  color: #2196F3;
}

.embed-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
}

.embed-error p {
  margin-bottom: 15px;
  font-size: 16px;
}

.embed-error button {
  background: #2196F3;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.embed-error button:hover {
  background: #1976D2;
}
</style>
