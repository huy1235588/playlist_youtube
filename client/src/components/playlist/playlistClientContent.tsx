'use client';

import Loading from "@/components/ui/loading/loading";
import { Playlist, Video } from "@/types/youtube";
// import { useSearchParams } from "next/navigation"; // Bỏ import useSearchParams vì playlistId được truyền qua prop
import { useCallback, useEffect, useState, useMemo } from "react";
import { gql } from '@apollo/client';
import client from '@/config/apollo'; // Đảm bảo client này hoạt động phía client

import './playlistClientContent.css'; // Import CSS, có thể quản lý global
import VideoItem from "@/components/playlist/videos/videoItem";
import SearchInput from "@/components/ui/SearchInput";
import { FaArrowUp } from "react-icons/fa";
import PlaylistMenu from "./playlistMenu";
import SortMenu from "./sortMenu";

// Custom hook để debounce giá trị
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

// Custom hook để cuộn trang về đầu với hiệu ứng animation
const useScrollToTop = () => {
    return useCallback(() => {
        const duration = 1000; // Thời gian animation tính bằng ms
        const start = window.pageYOffset;
        const startTime = performance.now();

        // Hàm easing để tạo hiệu ứng mượt
        const easeInOutCubic = (t: number) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        // Hàm animation cuộn trang
        const animateScroll = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = easeInOutCubic(progress);

            window.scrollTo(0, start * (1 - easedProgress));

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }, []);
};

// Query GET_VIDEOS để tải thêm video
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

// Query SEARCH_VIDEOS để tìm kiếm video trong playlist
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

// --- Client Component ---
// Định nghĩa interface cho props của PlaylistClientContent
interface PlaylistClientContentProps {
    playlist: Playlist;
    initialVideos: Video[];
    initialIsOverVideo: boolean;
    playlistId: string;
    initialPageSize: number;
    cssClass?: string; // Thêm css_class nếu cần
}

function PlaylistClientContent({
    playlist,
    initialVideos,
    initialIsOverVideo,
    playlistId,
    initialPageSize,
    cssClass = "", // Giá trị mặc định là chuỗi rỗng
}: PlaylistClientContentProps) {

    // Quản lý state với giá trị khởi tạo từ props
    const [loading, setLoading] = useState(false); // Quản lý trạng thái loading
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [videos, setVideos] = useState<Video[]>(initialVideos);

    // Nếu có video ban đầu, bắt đầu tải từ trang 2; nếu không thì từ trang 1
    const [videoPage, setVideoPage] = useState(initialVideos.length > 0 ? 2 : 1);
    const [isOverVideo, setIsOverVideo] = useState(initialIsOverVideo);
    const [currentError, setCurrentError] = useState<string | null>(null); // Quản lý lỗi phía client nếu có
    const [sort, setSort] = useState({ column: "publishedAt", order: "desc" }); // Mặc định sắp xếp theo publishedAt giảm dần

    // Debounce search query để giảm số lần gọi API khi người dùng gõ
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Hook để cuộn về đầu trang
    const scrollToTop = useScrollToTop();

    // Lấy tên playlist từ props
    const playlistName = playlist.Title;

    // Hàm để lấy dữ liệu video
    const getVideos = async ({
        column = "publishedAt",
        order = "desc",
    }) => {
        try {
            setLoading(true);
            setCurrentError(null);

            const { data } = await client.query({
                query: GET_VIDEOS,
                variables: {
                    PageNumber: 1, // Luôn tải từ trang đầu tiên khi gọi hàm này
                    PageSize: initialPageSize,
                    column,
                    order,
                    playlistId,
                },
                fetchPolicy: 'network-only',
            });

            if (data.videos?.success && data.videos.data) {
                setVideos(data.videos.data.videos);
                setIsOverVideo(data.videos.data.isOverVideo);
                setVideoPage(data.videos.data.isOverVideo ? 1 : 2); // Nếu đã hết video, giữ nguyên trang 1
            } else {
                throw new Error(data.videos?.error || 'Failed to fetch videos');
            }

        } catch (error) {
            console.error("Error fetching videos:", error);
            setCurrentError(error instanceof Error ? error.message : 'An unknown error occurred while fetching videos.');
        } finally {
            setLoading(false);
        }
    };

    // Memoize danh sách video để tránh render lại không cần thiết
    const videoList = useMemo(() => (
        <div className="video-list">
            {videos.map((video, index) => (
                <VideoItem
                    key={`${video.VideoId}-${index}`} // Sử dụng key kết hợp VideoId và index
                    // Chỉ số index tăng dần dựa trên thứ tự hiện tại của danh sách
                    index={index + 1}
                    video={video}
                />
            ))}
        </div>
    ), [videos]);

    // Hàm để tải thêm video (phía client)
    const getMoreVideos = useCallback(async ({
        column = "publishedAt", // Mặc định sắp xếp theo publishedAt
        order = "desc",
    }) => {
        // Kiểm tra điều kiện: nếu đang tải, đã load hết video, hoặc đang search thì không thực hiện
        if (loadingMore || isOverVideo || debouncedSearchQuery) return null;

        setLoadingMore(true);
        setCurrentError(null); // Xóa lỗi cũ nếu có

        try {
            const { data } = await client.query({
                query: GET_VIDEOS,
                variables: {
                    PageNumber: videoPage,
                    PageSize: initialPageSize, // Dùng cùng số lượng video mỗi trang
                    column,
                    order,
                    playlistId,
                },
                fetchPolicy: 'network-only', // Đảm bảo dữ liệu mới nhất
            });

            const videosData = data.videos?.data;

            if (data.videos?.success && videosData) {
                // Cập nhật danh sách video, thêm vào sau danh sách hiện tại
                setVideos(prev => [...prev, ...(videosData.videos || [])]);
                setIsOverVideo(videosData.isOverVideo);
                if (!videosData.isOverVideo) {
                    setVideoPage(prev => prev + 1); // Tăng số trang nếu còn video
                }
                return videosData; // Trả về dữ liệu nếu cần dùng lại
            } else {
                throw new Error(data.videos?.error || 'Failed to fetch more videos');
            }

        } catch (error) {
            console.error("Error fetching more videos:", error);
            setCurrentError(error instanceof Error ? error.message : 'An unknown error occurred while loading more videos.');
            // Có thể dừng tải thêm nếu lỗi xảy ra
            return null;
        } finally {
            setLoadingMore(false);
        }
    }, [playlistId, videoPage, loadingMore, isOverVideo, initialPageSize, debouncedSearchQuery]);

    // Hàm tìm kiếm video (phía client)
    const searchVideos = useCallback(async (query: string) => {
        // Nếu query rỗng sau debounce thì không thực hiện tìm kiếm
        if (!query) return;

        setIsSearching(true);
        setCurrentError(null); // Xóa lỗi cũ nếu có
        // Không có phân trang cho tìm kiếm trong code gốc
        try {
            const { data } = await client.query({
                query: SEARCH_VIDEOS,
                variables: {
                    query,
                    playlistId,
                    // PageNumber: 1, // Thêm nếu search hỗ trợ phân trang
                    // PageSize: 50,  // Thêm nếu search hỗ trợ phân trang
                },
                fetchPolicy: 'network-only', // Đảm bảo kết quả tìm kiếm mới nhất
            });

            // Xử lý dựa trên cấu trúc trả về của searchVideos
            if (data.searchVideos?.success && data.searchVideos.data) {
                setVideos(data.searchVideos.data); // Thay thế danh sách video bằng kết quả tìm kiếm
                setIsOverVideo(true); // Giả sử tìm kiếm trả về tất cả kết quả, tắt load more
                setVideoPage(1); // Đặt lại số trang vì ngữ cảnh đã thay đổi
            } else {
                // Xử lý trường hợp search thất bại hoặc trả về lỗi
                console.error("Search failed:", data.searchVideos?.error);
                setVideos([]); // Xóa danh sách video nếu tìm kiếm thất bại
                setIsOverVideo(true); // Ngăn không cho load thêm sau khi tìm kiếm thất bại
                setCurrentError(data.searchVideos?.error || 'Failed to perform search.');
            }

        } catch (error) {
            console.error("Error searching videos:", error);
            setVideos([]); // Xóa danh sách video nếu có lỗi trong quá trình tìm kiếm
            setIsOverVideo(true); // Ngăn không cho load thêm video
            setCurrentError(error instanceof Error ? error.message : 'An unknown error occurred during search.');
        } finally {
            setIsSearching(false);
        }
    }, [playlistId]);

    // Handler để xóa search và trở lại trạng thái ban đầu
    const handleClear = useCallback(() => {
        setSearchQuery("");
        setVideos(initialVideos); // Khôi phục danh sách video ban đầu
        setIsOverVideo(initialIsOverVideo); // Đặt lại trạng thái đã load hết hay chưa
        setVideoPage(initialVideos.length > 0 ? 2 : 1); // Đặt lại số trang
        setCurrentError(null); // Xóa lỗi hiện tại
        // Không cần gọi fetchData vì việc reset state đã xử lý
    }, [initialVideos, initialIsOverVideo]); // Phụ thuộc vào giá trị ban đầu từ props

    // Effect để xử lý thay đổi của debouncedSearchQuery
    useEffect(() => {
        if (debouncedSearchQuery) {
            searchVideos(debouncedSearchQuery);
        } else if (searchQuery === '') {
            // Nếu search query bị xóa (không chỉ là rỗng lúc đầu)
            // Kiểm tra nếu danh sách video hiện tại khác với ban đầu (có nghĩa là đã có search trước đó)
            if (videos !== initialVideos) {
                handleClear(); // Gọi handleClear để khôi phục lại
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, searchVideos]); // handleClear không cần thêm vì đã được gọi bên trong

    // Handler để kiểm tra cuộn trang cho việc load thêm video
    const handleScroll = useCallback(() => {
        // Sử dụng một khoảng cách đệm (buffer) để kích hoạt tải thêm trước khi chạm đáy trang
        const buffer = 50;
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

        // Kiểm tra các điều kiện để tránh gọi tải thêm không cần thiết
        if (loadingMore || isOverVideo || isSearching || debouncedSearchQuery) {
            // console.log("Scroll load aborted:", { loadingMore, isOverVideo, isSearching, debouncedSearchQuery });
            return;
        }

        if (scrollTop + clientHeight >= scrollHeight - buffer) {
            // Gọi hàm tải thêm video
            getMoreVideos({
                column: sort.column,
                order: sort.order,
            });
        }
    }, [loadingMore, isOverVideo, isSearching, debouncedSearchQuery, getMoreVideos]);

    // Effect để thêm và xóa scroll listener
    useEffect(() => {
        // Chỉ thêm listener nếu chưa load hết video và không đang tìm kiếm
        if (!isOverVideo && !debouncedSearchQuery && !loading) {
            window.addEventListener("scroll", handleScroll);
            // console.log("Scroll listener added.");
        } else {
            // console.log("Scroll listener NOT added or removed.");
            window.removeEventListener("scroll", handleScroll);
        }

        // Cleanup listener khi component unmount hoặc điều kiện thay đổi
        return () => {
            // console.log("Removing scroll listener.");
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll, isOverVideo, debouncedSearchQuery, loading]); // Re-evaluate khi các giá trị thay đổi

    // Hàm xử lý thay đổi sắp xếp video
    const handleSortChange = useCallback(async (column: string, order: string) => {
        setSort({ column, order });
        setLoading(true);
        setCurrentError(null);

        try {
            await getVideos({ column, order });
        } catch (error) {
            console.error("Error fetching sorted videos:", error);
            setCurrentError(error instanceof Error ? error.message : 'An unknown error occurred while sorting videos.');
        } finally {
            setLoading(false);
        }
    }, [getVideos]);

    // --- Render giao diện ---
    return (
        <main className={`main ${cssClass}`}>
            {/* Hiển thị tên playlist */}
            <h1 className="playlist-name">
                {playlistName}
            </h1>

            <div className="playlist-header">
                {/* Input tìm kiếm video trong playlist */}
                <SearchInput
                    placeholder="Tìm kiếm video trong playlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    loading={isSearching}
                    onClear={handleClear} // Sử dụng handler để xóa tìm kiếm
                />

                {/* Menu */}
                <PlaylistMenu />
            </div>

            {/* Menu sắp xếp video */}
            <SortMenu
                onSortChange={handleSortChange}
                defaultColumn={sort.column} // Truyền giá trị mặc định cho menu
                defaultOrder={sort.order} // Truyền giá trị mặc định cho menu
            />

            {/* Kiểm tra trạng thái loading */}
            {loading && (
                <Loading
                    size="400px"
                    color="rgb(165, 165, 165);"
                />
            )}

            {/* Hiển thị thông báo lỗi phía client nếu có */}
            {currentError && (
                <div className="error-message client-error">
                    <p>Error: {currentError}</p>
                </div>
            )}

            {/* Loading ban đầu được xử lý bởi SSR/Suspense, chỉ hiển thị trạng thái phía client */}
            {/* Trường hợp: Đang tìm kiếm và không có kết quả trả về */}
            {debouncedSearchQuery && !isSearching && videos.length === 0 && (
                <div className="no-video">
                    <p>Không tìm thấy video nào khớp với "{debouncedSearchQuery}".</p>
                </div>
            )}

            {/* Trường hợp: Playlist không có video và không đang tìm kiếm */}
            {!debouncedSearchQuery && videos.length === 0 && !loadingMore && (
                <div className="no-video">
                    <p>Playlist này không có video nào.</p>
                </div>
            )}

            {/* Hiển thị danh sách video nếu có */}
            {videos.length > 0 && !loading && !isSearching && !currentError
                && videoList
            }

            {/* Hiển thị indicator khi đang tải thêm hoặc tìm kiếm */}
            {(loadingMore || isSearching || loading) && (
                <Loading
                    size={loadingMore ? "200px" : "300px"} // Kích thước khác nhau tùy trạng thái
                    color="rgb(165, 165, 165);"
                // text={isSearching ? "Đang tìm kiếm..." : ""} // Có thể thêm text nếu cần
                />
            )}

            {/* Nút cuộn trang về đầu */}
            <button
                id="scroll-to-top"
                className="scroll-to-top" // Có thể thêm logic hiển thị/ẩn tùy vị trí cuộn trang
                onClick={scrollToTop}
                aria-label="Scroll back to top"
            >
                <FaArrowUp />
            </button>
        </main>
    );
}

export default PlaylistClientContent;
