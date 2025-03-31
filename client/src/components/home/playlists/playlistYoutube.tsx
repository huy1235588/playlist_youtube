'use client';

import axios from "@/config/axios";
import PlaylistItem from "./items/playlistItem";
import { useEffect, useState } from "react";
import { Playlist } from "@/types/youtube";

import './playlistYoutube.css'; // Import CSS cho component

function PlaylistYoutube() {
    // Khai báo biến
    const [playlists, setPlaylists] = useState<Playlist[]>([]); // Danh sách playlist

    // Hàm để lấy playlist
    const getPlaylists = async () => {
        try {
            // Gọi api
            const response = await axios.get('/api/playlist/get');

            // Lấy dữ liệu
            const result = await response.data.playlists;
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
            <h1>
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