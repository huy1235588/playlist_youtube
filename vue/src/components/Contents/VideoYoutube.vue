<template>
    <section id="video" class="video flex">
        <div id="index-container">
            <div id="icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    focusable="false"
                    aria-hidden="true"
                    style="
                        pointer-events: none;
                        display: inherit;
                        width: 100%;
                        height: 100%;
                    "
                >
                    <path d="M21 10H3V9h18v1Zm0 4H3v1h18v-1Z"></path>
                </svg>
            </div>
        </div>
        <div id="content">
            <div id="thumbnail-container">
                <a id="thumbnail">
                    <!-- Hình ảnh video -->
                    <img
                        src="https://i.ytimg.com/vi/F_kv67JHhmw/maxresdefault.jpg"
                        alt=""
                    />
                    <div id="overplay">
                        <!-- Thời lượng video -->
                        <div id="time-status">
                            <div class="badge-shape">
                                <span class="text"> 2:97 </span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            <div id="meta">
                <!-- Tên video -->
                <h3 class="video-title-container">
                    <a href="" id="video-title"> AViVA - SCREAM </a>
                </h3>
                <div class="flex">
                    <div id="metadata" class="flex">
                        <div id="byline-container" class="flex">
                            <!-- Tên channel -->
                            <div id="channel-name">
                                <div id="container">
                                    <div id="text-container">
                                        <div id="text">
                                            <a href="">Nightblue Music</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Khoảng cách -->
                            <div id="separator">•</div>
                            <!-- Thông tin video -->
                            <div id="video-info">
                                <span id="view-count">480M</span>
                                <span id="separator"> • </span>
                                <span id="published-at">1 tháng trước</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="menu">
            <MenuTask />
        </div>
    </section>
</template>

<script setup>
import MenuTask from '../menu/MenuTask.vue';

</script>

<style scoped>
#video {
    display: flex;
    align-items: center;
    border-radius: 12px;
    text-align: start;
    /* transition: all 0.3s ease-in-out; */
}

#video:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Index */
#index-container #icon {
    padding: 0 6px;
    fill: #fff;
}

/* Content */
#content {
    display: flex;
    flex: 1;
    padding: 8px 0;
    cursor: pointer;
}

/* Menu */
#menu {
    width: 40px;
}

/* Thumbnail */
#thumbnail-container {
    width: 240px;
    height: 135px;
    margin-right: 8px;
}

#thumbnail {
    display: block;
    height: 100%;
    cursor: pointer;
    position: relative;
}

#thumbnail img {
    width: 100%;
    height: 100%;
}

/* Time status */
#time-status {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 4px;
}

#time-status .badge-shape {
    background-color: rgba(0, 0, 0, 0.6);
}

#time-status .text {
    color: #fff;
    font-size: 1.2rem;
    line-height: 1.5rem;
    font-weight: 500;
}

/* Meta */
#meta {
    flex: 1;
    flex-basis: 0.0000001px;
}

/* Title video */
.video-title-container {
    margin-bottom: 10px;
}

#video-title {
    color: #29911f;
    font-size: 2.2rem;
    line-height: 2.2rem;
}

/* Metadata */
#byline-container {
    align-items: center;
    color: #aaa;
}

/* Separator */
#separator {
    display: inline-block;
    margin: 0 4px;
    font-size: 1.4rem;
    line-height: 1.8rem;
    font-weight: 400;
}

/* Video info */
#video-info,
#channel-name {
    font-size: 1.6rem;
    line-height: 1.8rem;
    font-weight: 400;
}
</style>