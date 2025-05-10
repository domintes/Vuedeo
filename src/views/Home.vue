<template>
  <div class="home bookmarks-container">
    <Navbar :gridColumns="gridColumns" @update-grid-columns="updateGridColumns" />
    <h1>Video Library</h1>
    
    <import-section
      :selected-file="selectedFile"
      @file-selected="handleFileUpload"
      @file-clear="clearSelectedFile"
      @import="importFile"
    />

    <video-grid
      v-if="playlists.length"
      :videos="filteredVideos"
      :tag-list="tagList"
      :columns="gridColumns"
      @video-click="openVideoModal"
      @tag-toggle="toggleTag"
    />

    <video-modal
      :video="selectedVideo"
      v-if="showVideoModal"
      @close="closeVideoModal"
    />

    <!-- Error Bar -->
    <div v-if="errorMessage" class="error-bar">
      <i class="pi pi-exclamation-triangle"></i>
      <span>{{ errorMessage }}</span>
      <button @click="clearError" class="close-error-btn">&times;</button>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import ImportSection from '@/components/ImportSection.vue';
import VideoGrid from '@/components/VideoGrid.vue';
import VideoModal from '@/components/VideoModal.vue';
import Papa from 'papaparse';
import 'primeicons/primeicons.css';

export default {  name: 'Home',
  components: {
    Navbar,
    ImportSection,
    VideoGrid,
    VideoModal
  },
  data() {
    return {
      selectedFile: null,
      playlists: [],
      gridColumns: 5,
      selectedTags: [],
      allTags: new Set(),
      showVideoModal: false,
      selectedVideo: null,
      embedError: false,
      htmlContent: null,
      errorMessage: null, // Holds the error message to display
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
  },  methods: {    
    handleFileUpload(file) {
      this.selectedFile = file;
      // Reset HTML content when a new file is selected
      this.htmlContent = null;
    },
    toggleTag(tag) {
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
            videos: validRows.map(row => ({              id: String(row.id),
              title: row.title || 'Untitled Video',
              url: row.url,
              cover: row.cover || '',
              note: row.note || '',
              tags: (row.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag).join(', '),
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

    async importHTML() {
      if (!this.selectedFile || !this.selectedFile.name.endsWith('.html')) return;

      try {
        const text = await this.selectedFile.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Process all DL elements (collections)
        const collections = this.processCollections(doc.querySelector('DL'));
        
        // Convert collections to playlists
        this.playlists = collections.map(collection => ({
          id: collection.id || 'imported',
          name: collection.title || 'Imported Bookmarks',
          description: collection.description || '',
          videos: collection.bookmarks.map((bookmark, index) => ({
            id: String(Date.now() + index),
            title: bookmark.title,
            url: bookmark.url,
            cover: bookmark.cover || '',
            note: bookmark.description || '',
            tags: bookmark.tags || '',
            created: bookmark.addDate ? new Date(bookmark.addDate * 1000).toISOString() : '',
            important: bookmark.important || false
          }))
        }));

        // Extract tags from the videos
        if (this.playlists.length > 0) {
          this.extractTags(this.playlists[0].videos);
        }

        // Store in localStorage
        localStorage.setItem('playlists', JSON.stringify(this.playlists));

      } catch (error) {
        console.error('Error parsing HTML:', error);
        alert('Error parsing HTML file');
      }
    },

    processCollections(dl, level = 0) {
      if (!dl) return [];

      const collections = [];
      let currentCollection = {
        id: Date.now().toString(),
        title: '',
        bookmarks: [],
        subCollections: []
      };

      for (const child of dl.children) {
        if (child.tagName === 'DT') {
          const h3 = child.querySelector('H3');
          if (h3) {
            // Start a new collection
            if (currentCollection.bookmarks.length > 0 || currentCollection.title) {
              collections.push(currentCollection);
            }
            currentCollection = {
              id: Date.now().toString() + Math.random(),
              title: h3.textContent,
              bookmarks: [],
              subCollections: []
            };
          } else {
            const a = child.querySelector('A');
            if (a) {              // Add bookmark to current collection
              const tags = a.getAttribute('TAGS') || '';
              currentCollection.bookmarks.push({
                title: a.textContent,
                url: a.getAttribute('HREF'),
                addDate: parseInt(a.getAttribute('ADD_DATE')),
                lastModified: parseInt(a.getAttribute('LAST_MODIFIED')),
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag).join(', '),
                cover: a.getAttribute('DATA-COVER'),
                important: a.getAttribute('DATA-IMPORTANT') === 'true',
                description: child.querySelector('DD blockquote')?.textContent
              });
            }
          }
        } else if (child.tagName === 'DL') {
          // Process nested collection
          const subCollections = this.processCollections(child, level + 1);
          currentCollection.subCollections.push(...subCollections);
        }
      }

      // Add the last collection if it has content
      if (currentCollection.bookmarks.length > 0 || currentCollection.title) {
        collections.push(currentCollection);
      }

      return collections;
    },

    handleImageError(event) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    },

    triggerFileInput() {
      // Programmatically click the hidden file input
      this.$refs.fileInput.click();
    },

    importFile() {
      if (!this.selectedFile) {
        this.showError('No file selected. Please select a file to import.');
        return;
      }

      try {
        if (this.selectedFile.name.endsWith('.html')) {
          this.importHTML();
        } else if (this.selectedFile.name.endsWith('.csv')) {
          this.importCSV();
        } else {
          this.showError('Unsupported file type. Please select a .csv or .html file.');
        }
      } catch (error) {
        this.showError('An error occurred during the import process.');
        console.error(error);
      }
    },

    showError(message) {
      this.errorMessage = message;
    },

    clearError() {
      this.errorMessage = null;
    },

    clearSelectedFile() {
      this.selectedFile = null;
    }
  },  mounted() {
    // Load any existing playlists from localStorage
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
      this.playlists = JSON.parse(savedPlaylists);
    }
    
    // Restore last selected file info
    const lastSelectedFile = localStorage.getItem('lastSelectedFile');
    if (lastSelectedFile) {
      this.selectedFile = JSON.parse(lastSelectedFile);
    }
  }
};
</script>

<style lang="scss">
@use '../assets/styles/_home.scss';
</style>
