'use client';

import { Video } from "@/types/youtube";

import "./videoItem.css"; // Import CSS cho component
import { useEffect, useState } from "react";
import { formatDuration, formatViewCount, timeAgo } from "@/utils/formatDataVideo";
import VideoItemMenu from "./videoItemMenu";

interface VideoItemProps {
    video: Video;
    index: number;
}

const VideoItem: React.FC<VideoItemProps> = ({
    video,
    index,
}) => {
    const [formattedVideo, setFormattedVideo] = useState<Video>(video);

    // format dữ liệu
    useEffect(() => {
        const newVideo = { ...video }; // clone đối tượng video để không mutate props
        newVideo.ViewCount = formatViewCount(newVideo.ViewCount);
        newVideo.Duration = formatDuration(newVideo.Duration);
        newVideo.PublishedAt = timeAgo(newVideo.PublishedAt);
        setFormattedVideo(newVideo);
    }, [video]);

    return (
        <div
            id={`video-${formattedVideo.VideoId}`}
            className="video flex"
        >
            {/* Index */}
            <div id="index-container">
                {index}
            </div>

            {/* Nội dung chính */}
            <div className="content">
                {/* Hình ảnh video */}
                <div id="thumbnail-container">
                    <a id="thumbnail">
                        {/* Hình ảnh video */}
                        <img src={formattedVideo.Thumbnails}
                            alt={formattedVideo.VideoTitle}
                        />
                        <div id="overplay">
                            {/* Thời lượng video */}
                            <div id="time-status">
                                <div className="badge-shape">
                                    <span className="text">
                                        {formattedVideo.Duration}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>

                {/* Nội dung video */}
                <div id="meta">
                    {/* Tên video */}
                    <h3 className="video-title-container">
                        <a href=""
                            id="video-title"
                        >
                            {formattedVideo.VideoTitle}
                        </a>
                    </h3>

                    {/* Mô tả video */}
                    <div className="flex">
                        <div id="metadata" className="flex">
                            <div id="byline-container" className="flex">
                                {/* Tên channel */}
                                <div id="channel-name">
                                    <div id="container">
                                        <div id="text-container">
                                            <div id="text">
                                                <a href="">
                                                    {formattedVideo.ChannelTitle}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin video */}
                                <div id="video-info">
                                    {/* Khoảng cách */}
                                    <div id="separator">•</div>

                                    {/* Số lượt xem */}
                                    <span id="view-count">
                                        {formattedVideo.ViewCount} lượt xem
                                    </span>

                                    <span id="separator"> • </span>

                                    {/* Ngày đăng video */}
                                    <span id="published-at">
                                        {formattedVideo.PublishedAt}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu video */}  
            <VideoItemMenu />
        </div>
    );
};

export default VideoItem;