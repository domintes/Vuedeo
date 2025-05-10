<template>
  <div class="tag-section">
    <div class="tag-filters">
      <button
        v-for="tag in tags"
        :key="tag.name"
        @click="$emit('tag-toggle', tag.name)"
        :class="['tag', { 
          active: tag.isActive,
          disabled: tag.count === 0 
        }]"
        :disabled="tag.count === 0"
      >
        {{ tag.name }} ({{ tag.count }})
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagsFilter',
  props: {
    tags: {
      type: Array,
      required: true
    }
  },
  emits: ['tag-toggle']
};
</script>
