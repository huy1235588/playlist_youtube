'use client';

import { Channel, Playlist } from "@/types/youtube";
import { CgPlayList } from "react-icons/cg";
import { FaPlay } from "react-icons/fa";

import './playlistItem.css?v=1.0.0'; // Import CSS cho component
import { useEffect, useState } from "react";
import PlaylistItemMenu from "./playlistItemMenu";
import { gql } from "@apollo/client";
import client from "@/config/apollo";

// Định nghĩa các props nếu cần thiết
interface PlaylistItemProps {
    playlist: Playlist
}

const GET_CHANNEL_BY_CHANNEL_ID = gql`
    query GetChannelByChannelId($channelId: String!) {
        channel(channelId: $channelId) {
            success
            data {
                ChannelId
                Title
                Thumbnails
                SubscriberCount
                ViewCount
            }
            error
        }
    }
`;

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
            const { data } = await client.query({
                query: GET_CHANNEL_BY_CHANNEL_ID,
                variables: {
                    channelId: playlist.ChannelId
                }
            });

            // Lấy dữ liệu
            const result = data.channel.data;
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
            <div id="content-playlist-item">
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