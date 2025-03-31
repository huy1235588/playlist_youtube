'use client';

import axios from "@/config/axios";
import { Channel, Playlist } from "@/types/youtube";
import { CgPlayList } from "react-icons/cg";
import { FaPlay } from "react-icons/fa";

import './playlistItem.css'; // Import CSS cho component
import { useEffect, useState } from "react";
import PlaylistItemMenu from "./playlistItemMenu";

// Định nghĩa các props nếu cần thiết
interface PlaylistItemProps {
    playlist: Playlist
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({
    playlist
}) => {
    // Khai báo biến
    const [channels, setChannels] = useState<Channel>(); // Danh sách kênh
    const [isHover, setIsHover] = useState(false); // Biến trạng thái hover

    // Hàm để lấy channel
    const getChannel = async () => {
        try {
            // Gọi api
            const response = await axios.get('/api/channel/get', {
                params: {
                    channelId: playlist.ChannelId // Lấy channelId từ playlist
                }
            });

            // Lấy dữ liệu
            const result = await response.data.channel[0];
            setChannels(result); // Cập nhật danh sách kênh

        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    };

    // Gọi hàm lấy channel khi component được mount
    useEffect(() => {
        getChannel();
    }, []);

    return (
        <div className="playlist-item"
            onMouseEnter={() => setIsHover(true)} // Khi hover vào
            onMouseLeave={() => setIsHover(false)} // Khi hover ra
        >
            <div id="content">
                {/* Hình ảnh thumbnail */}
                <div id="thumbnail-container" className="no-select">
                    <a href={`/playlist?list=${playlist.PlaylistId}`}
                        id="thumbnail"
                    >
                        {/* Hình ảnh thumbnail */}

                        <img src={playlist.Thumbnails ? playlist.Thumbnails : "/images/no_thumbnail.jpg"}
                            alt="Thumbnail"
                            id="thumbnail-img"
                        />

                        {/* Hiện số lượng video trong playlist */}
                        <div id="overplay">
                            <div id="item-count">
                                <div className="badge-shape">
                                    {/* Icon */}
                                    <div className="icon">
                                        <CgPlayList />
                                    </div>

                                    {/* Số lượng video */}
                                    <span className="text">
                                        {playlist.ItemCount} video
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hover effect */}
                        <div className={`thumbnail-hover ${isHover ? 'thumbnail-hovered' : ''}`}>
                            <div className="thumbnail-hover-overplay">
                                <div className="thumbnail-hover-icon">
                                    <FaPlay />
                                </div>
                                <span className="thumbnail-hover-text no-select">
                                    Xem tất cả
                                </span>
                            </div>
                        </div>
                    </a>
                </div>

                {/* Tên playlist và tên kênh */}
                <div className="meta">
                    {/* Tên Playlist */}
                    <h3 className="playlist-title-container">
                        <a href={`/playlist?list=${playlist.PlaylistId}`}
                            id="playlist-title"
                            className="no-select"
                        >
                            {playlist.Title}
                        </a>

                        {/* Menu */}
                        <PlaylistItemMenu />
                    </h3>

                    {/* Tên kênh */}
                    <div className="channel-name">
                        <div className="channel-container no-select">
                            {/* Thumbnail chanel */}
                            <div className="thumbnail-channel">
                                <a href={`https://youtube.com/channel/${channels?.ChannelId}`}
                                    className="thumbnail-channel-overplay"
                                >
                                    <img src={channels?.Thumbnails}
                                        alt="Thumbnail"
                                        id="thumbnail-img"
                                    />
                                </a>
                            </div>

                            {/* Tên kênh */}
                            <div className="channel-name-text">
                                <a href={`https://youtube.com/channel/${channels?.ChannelId}`}
                                    id="channel-name"
                                    className="no-select"
                                >
                                    {channels?.Title}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlaylistItem;