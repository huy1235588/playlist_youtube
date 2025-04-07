'use client';

import PlaylistItem from "./items/playlistItem";
import { useEffect, useState } from "react";
import { Playlist } from "@/types/youtube";
import { gql } from "@apollo/client";

import './playlistYoutube.css'; // Import CSS cho component
import client from "@/config/apollo";

const GET_PLAYLISTS = gql`
    query GetPlaylists {
        playlists {
             success
            data {
                PlaylistId
                Title
                PublishedAt
                Thumbnails
                ChannelId
                ChannelTitle
                ItemCount
            }
            error
        }
    }
`;

function PlaylistYoutube() {
    // Khai báo biến
    const [playlists, setPlaylists] = useState<Playlist[]>([]); // Danh sách playlist

    // Hàm để lấy playlist
    const getPlaylists = async () => {
        try {
            // Gọi api
            const { data } = await client.query({
                query: GET_PLAYLISTS,
            });

            // Lấy dữ liệu
            const result = data.playlists.data;
            setPlaylists(result); // Cập nhật danh sách playlist


        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    };

    // Gọi hàm lấy playlist khi component được mount
    useEffect(() => {
        getPlaylists();
    }, []);

    return (
        <div className="content-playlist">
            {/* Tiêu đề */}
            <h1 className="title-playlist">
                Playlist Youtube
            </h1>

            {/* Danh sách playlist */}
            <ul className="playlist-list">
                {playlists.map((playlist, index) => (
                    <li key={index}>
                        <PlaylistItem playlist={playlist} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PlaylistYoutube;