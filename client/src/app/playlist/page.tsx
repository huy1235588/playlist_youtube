'use client';

import Loading from "@/components/ui/loading/loading";
import { Playlist, Video } from "@/types/youtube";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { gql } from '@apollo/client';
import client from '@/config/apollo';

import './playlistPage.css?v=1.0.0'; // Import CSS cho component
import VideoItem from "@/components/home/videos/videoItem";
import SearchInput from "@/components/ui/SearchInput";

// Hàm để tìm kiếm video
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hàm để lấy video
const GET_VIDEOS = gql`
    query GetVideos($PageNumber: Int, $PageSize: Int, $column: String, $order: String, $playlistId: String) {
        videos(PageNumber: $PageNumber, PageSize: $PageSize, column: $column, order: $order, playlistId: $playlistId) {
            success
            data {
                videos {
                    VideoId
                    VideoTitle
                    ChannelId
                    ChannelTitle
                    ViewCount
                    PublishedAt
                    Thumbnails
                    Duration
                    AddedAt
                    IndexVideo
                }
                isOverVideo
            }
            error
        }
    }
`;

// Hàm để lấy playlist by playlistId
const GET_PLAYLISTS_BY_ID = gql`
    query GetPlaylistsById($playlistId: String!) {
        playlist(id: $playlistId) {
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

// Hàm để tìm kiếm video
const SEARCH_VIDEOS = gql`
    query SearchVideos($query: String!, $playlistId: String!, $PageNumber: Int, $PageSize: Int) {
        searchVideos(query: $query, playlistId: $playlistId, PageNumber: $PageNumber, PageSize: $PageSize) {
            success
            data {
                VideoId
                VideoTitle
                ChannelId
                ChannelTitle
                ViewCount
                PublishedAt
                Thumbnails
                Duration
                AddedAt
                IndexVideo
            }
            error
        }
    }
`;

function PlaylistPage() {
    const searchParams = useSearchParams();
    // Khai báo biến
    const [loading, setLoading] = useState(true); // Biến trạng thái loading
    const [loadingMore, setLoadingMore] = useState(false); // Biến trạng thái loading cho load thêm video
    const [searchQuery, setSearchQuery] = useState(""); // State for search input
    const [isSearching, setIsSearching] = useState(false); // State for search loading
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounced search query

    const [playlistName, setPlaylistName] = useState("");
    const [videoStart, setVideoStart] = useState(1); // Biến trạng thái videoStart
    const [videos, setVideos] = useState<Video[]>([]); // Danh sách video
    const [isOverVideo, setIsOverVideo] = useState(false); // Biến trạng thái isOverVideo

    // Lấy id playlist từ url
    const playlistId = searchParams.get("list") || null;

    // Hàm để lấy playlist by playlistId
    const getPlaylistById = async (): Promise<Playlist> => {
        try {
            // Gọi API backend 
            const { data } = await client.query({
                query: GET_PLAYLISTS_BY_ID,
                variables: {
                    playlistId: playlistId
                }
            });

            // Trả về dữ liệu
            return data.playlist.data;
        }
        catch (error) {
            console.error("Error fetching playlist name:", error);
            // Re-throw the error to be caught by the caller
            throw error;
        }
    }

    // Hàm để lấy dữ liệu video
    const getVideos = async ({
        column = "publishedAt",
        order = "desc",
    }) => {
        try {
            const { data } = await client.query({
                query: GET_VIDEOS,
                variables: {
                    PageNumber: videoStart,
                    PageSize: 50,
                    column: column,
                    order: order,
                    playlistId: playlistId,
                }
            });

            return data.videos.data;
        }
        catch (error) {
            console.error("Error fetching videos:", error);
        }
        finally {
            setLoading(false);
        }
    };

    // Hàm để tải thêm video
    const loadMoreVideos = async () => {
        if (isOverVideo) return; // Nếu đã tải hết video thì không làm gì cả

        // Gọi hàm lấy dữ liệu video
        await fetchData({
            column: "publishedAt",
            order: "desc",
            isLoadMore: true,
        });
    };

    // Hàm để lấy dữ liệu 
    const fetchData = async ({
        column = "publishedAt",
        order = "desc",
        isLoadMore = false,
    }) => {
        try {
            // Đánh dấu đang gọi API theo mode
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            // Lấy tên playlist
            const playlist = await getPlaylistById();
            setPlaylistName(playlist.Title);

            // Gọi API backend 
            const data = await getVideos({
                column,
                order,
            });

            // Kiểm tra đã có video chưa
            if (videoStart === 1) {
                setVideos(data.videos || []);
            }
            else {
                // dữ liệu với các video đã tải về
                const newVideos = data.videos || [];

                // Gộp video mới với video hiện tại
                setVideos((prevVideos) => [...prevVideos, ...newVideos]);
            }

            // Kiểm tra xem có video nào không
            if (data.isOverVideo) {
                setIsOverVideo(true); // Đánh dấu đã tải hết video
            }

            // Cập nhật videoStart
            setVideoStart((prev) => prev + 1);

        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            // Đánh dấu không còn gọi API
            if (isLoadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    };

    // Hàm để tìm kiếm video
    const searchVideos = async (query: string) => {
        try {
            setIsSearching(true);
            const { data } = await client.query({
                query: SEARCH_VIDEOS,
                variables: {
                    query,
                    playlistId: playlistId,
                    PageNumber: 1,
                    PageSize: 50,
                }
            });

            // Cập nhật danh sách video
            setVideos(data.searchVideos.data);
        }
        catch (error) {
            console.error("Error fetching videos:", error);
        }
        finally {
            setIsSearching(false);
        }
    }

    // Hàm để tìm kiếm video khi có sự thay đổi
    useEffect(() => {
        if (debouncedSearchQuery) {
            searchVideos(debouncedSearchQuery);
        } else {
            // Reset to initial data when search is cleared
            setVideoStart(1);
            setIsOverVideo(false);
            fetchData({});
        }
    }, [debouncedSearchQuery]);

    // Hàm để xử lý sự kiện cuộn chuột
    const handleScroll = useCallback(() => {
        // Kiểm tra xem đã tải hết video chưa
        if (isOverVideo) return;

        // Kiểm tra có tìm kiếm video không
        if (debouncedSearchQuery) return;

        // Kiểm tra vị trí cuộn chuột
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

        // Nếu cuộn đến gần cuối trang và không đang tải video (đặc biệt là cả loadingMore)
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && !loadingMore) {
            loadMoreVideos();
        }
    }, [loading, loadingMore]);

    // Thêm sự kiện cuộn chuột khi component được mount
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);


    // Hàm để lấy dữ liệu khi component được mount
    useEffect(() => {
        fetchData({}); // Gọi hàm lấy dữ liệu

    }, [playlistId]); // Chỉ gọi khi playlistId thay đổi

    return (
        <main className="main">
            <h1 className="playlist-name">
                {playlistName}
            </h1>

            <SearchInput
                placeholder="Tìm kiếm video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                loading={isSearching}
            />

            {/* Kiểm tra trạng thái loading */}
            {loading && (
                <Loading
                    size="400px"
                    color="rgb(165, 165, 165);"
                />
            )}

            {/* Kiểm tra trạng thái không có video */}
            {!loading && videos.length === 0 && (
                <div className="no-video">
                    <p>No videos found.</p>
                </div>
            )}

            {/* Hiển thị danh sách video */}
            {!loading && videos.length > 0 && (
                <div className="video-list">
                    {videos.map((video, index) => (
                        <VideoItem
                            key={index}
                            index={index + 1}
                            video={video}
                        />
                    ))}
                </div>
            )}

            {/* Kiểm tra trạng thái loading thêm video */}
            {loadingMore && (
                <Loading
                    size="200px"
                    color="rgb(165, 165, 165);"
                />
            )}
        </main>
    );
}

export default PlaylistPage;