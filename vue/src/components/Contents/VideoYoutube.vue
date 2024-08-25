<template>
    <section id="video" className="video">
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
            <h3>
                <a href="" id="video-title"> AViVA - SCREAM </a>
            </h3>
            <div>
                <div id="metadata">
                    <div id="byline-container">
                        <!-- Tên channel -->
                        <div id="channel-name">
                            <div id="container">
                                <div id="text-container">
                                    <div id="tex">
                                        <a href=""> Nightblue Music </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Khoảng cách -->
                        <div id="separator"></div>
                        <!-- Thông tin video -->
                        <div id="video-info">
                            <span id="view-count"> 480M </span>
                            <span id="separator"> • </span>
                            <span id="published-at"> 1 tháng trước </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>

</script>

<style scoped>
#thumbnail-container {
    width: 240px;
    height: 135px;
}
#thumbnail {
    cursor: pointer;
}
#thumbnail img {
    width: 100%;
    height: 100%;
}
</style>