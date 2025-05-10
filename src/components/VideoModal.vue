<template>
  <div v-if="video" class="video-modal" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">&times;</button>
      <div class="video-player">
        <iframe
          v-if="!embedError"
          :src="video.url"
          frameborder="0"
          allowfullscreen
        ></iframe>
        <div v-else class="embed-error">
          <p>Unable to play this video.</p>
          <button @click="openInNewTab(video.url)">Watch on original site</button>
        </div>
      </div>
      <div class="video-details">
        <h2>{{ video.title }}</h2>
        <p v-if="video.note">{{ video.note }}</p>
        <div v-if="video.tags" class="modal-tags">
          Tags: {{ video.tags }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoModal',
  props: {
    video: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  data() {
    return {
      embedError: false
    };
  },
  methods: {
    openInNewTab(url) {
      window.open(url, '_blank');
      this.$emit('close');
    }
  },
  watch: {
    video: {
      immediate: true,
      handler(video) {
        if (video) {
          this.embedError = false;
          this.checkEmbedPermission(video.url);
        }
      }
    }
  },
  methods: {
    checkEmbedPermission(url) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;

      iframe.onerror = () => {
        this.embedError = true;
      };

      setTimeout(() => {
        try {
          const iframeContent = iframe.contentWindow;
          if (!iframeContent) {
            this.embedError = true;
          }
        } catch (e) {
          this.embedError = true;
        }
        document.body.removeChild(iframe);
      }, 1000);

      document.body.appendChild(iframe);
    },
    openInNewTab(url) {
      window.open(url, '_blank');
      this.$emit('close');
    }
  }
};
</script>
