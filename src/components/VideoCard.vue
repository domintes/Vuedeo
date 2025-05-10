<template>
  <div class="video-card" @click="$emit('click', video)">
    <div class="video-cover">
      <img
        :src="video.cover || defaultImage"
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
        <span v-for="tag in video.tags.split(', ')" :key="tag" class="tag-pill">
          {{ tag }}
        </span>
      </div>
      <div class="video-note" v-if="video.note">
        {{ video.note }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoCard',
  props: {
    video: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      defaultImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
    };
  },
  methods: {
    handleImageError(event) {
      event.target.src = this.defaultImage;
    }
  }
};
</script>
