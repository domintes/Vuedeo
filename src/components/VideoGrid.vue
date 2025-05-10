<template>
  <div class="content-section">
    <tags-filter
      v-if="tagList.length > 0"
      :tags="tagList"
      @tag-toggle="$emit('tag-toggle', $event)"
    />
    <div v-if="videos.length === 0" class="no-results">
      <em>No results found</em>
    </div>
    <div v-else class="video-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
      <video-card
        v-for="video in videos"
        :key="video.id"
        :video="video"
        @click="$emit('video-click', video)"
      />
    </div>
  </div>
</template>

<script>
import VideoCard from './VideoCard.vue';
import TagsFilter from './TagsFilter.vue';

export default {
  name: 'VideoGrid',
  components: {
    VideoCard,
    TagsFilter
  },
  props: {
    videos: {
      type: Array,
      required: true
    },
    tagList: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Number,
      default: 3
    }
  },
  emits: ['video-click', 'tag-toggle']
};
</script>
