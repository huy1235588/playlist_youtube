<template>
    <section :id="playlist - +data.PlaylistId">
        <div id="content">
            <div id="thumbnail-container">
                <a id="thumbnail">
                    <!-- Hình ảnh video -->
                    <img v-if="notFound" :src="NoThumbail" alt="" />
                    <img v-else :src="thumbnails" alt="" />
                    <div id="overplay">
                        <!-- Thời lượng video -->
                        <div id="time-status">
                            <div class="badge-shape">
                                <span class="text">{{ duration }}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </section>
</template>

<script setup>

import { onMounted, onUnmounted } from 'vue';
const props = defineProps({
    data: {
        type: Object,
        required: true,
    }
})

function formatData() {
    // Định dạng VideoId
    videoId.value = formatVideoId(props.data.VideoId);
    
    // Kiểm tra video bị xóa
    if (props.data.Duration !== null) {        
        PlaylistId.value = props.data.PlaylistId;
        Title.value = props.data.Title;
        thumbnails.value = props.data.Thumbnails;
        indexVideo.value = props.data.IndexVideo;
        
        // Định dạng lượt xem
        viewCount.value = formatViewCount(props.data.ViewCount);
        // Định dạng thời lượng video
        duration.value = formatDuration(props.data.Duration);
        // Lấy khoảng thời gian phát hành đến hiện tại
        publishedAt.value = timeAgo(props.data.PublishedAt);

        notFound.value = false;
    }
    else {
        notFound.value = true;
    }
}

onMounted(() => {
    formatData();
});

onUnmounted(() => {
    formatData();
});
</script>
