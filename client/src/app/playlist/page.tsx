// Import các thư viện và component cần thiết
import { gql } from '@apollo/client';
import client from '@/config/apollo'; // Đảm bảo client này hoạt động phía server
import { Playlist, Video } from '@/types/youtube';
import PlaylistClientContent from '@/components/playlist/playlistClientContent'; // Component phía client để hiển thị nội dung

// Định nghĩa truy vấn GraphQL để lấy thông tin playlist theo ID
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

// Định nghĩa truy vấn GraphQL để lấy danh sách video từ playlist
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

// Số lượng video được load ban đầu
const INITIAL_PAGE_SIZE = 50;

interface PlaylistPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

// Hàm fetch dữ liệu ban đầu từ server
async function getInitialData(playlistId: string | null) {
    if (!playlistId) {
        // Trường hợp không có playlistId
        return {
            playlist: null,
            initialVideos: [],
            initialIsOverVideo: true,
            error: 'No playlist ID provided'
        };
    }

    try {
        // Gọi song song 2 truy vấn: lấy thông tin playlist và danh sách video
        const [playlistResult, videosResult] = await Promise.all([
            client.query<{
                playlist: {
                    success: boolean;
                    data: Playlist | null; error?: string
                }
            }>({
                query: GET_PLAYLISTS_BY_ID,
                variables: { playlistId },
                // Có thể cân nhắc thêm fetchPolicy để xử lý cache
            }),
            client.query<{
                videos: {
                    success: boolean;
                    data: {
                        videos: Video[];
                        isOverVideo: boolean
                    } | null; error?: string
                }
            }>({
                query: GET_VIDEOS,
                variables: {
                    PageNumber: 1,
                    PageSize: INITIAL_PAGE_SIZE,
                    column: "publishedAt", // Sắp xếp mặc định theo thời gian đăng
                    order: "desc",         // Giảm dần
                    playlistId,
                },
                // Có thể thêm fetchPolicy nếu cần
            })
        ]);

        const playlistData = playlistResult.data?.playlist;
        const videosData = videosResult.data?.videos;

        // Kiểm tra dữ liệu playlist hợp lệ
        if (!playlistData?.success || !playlistData.data) {
            throw new Error(playlistData?.error || 'Failed to fetch playlist details');
        }

        // Nếu video không fetch được, trả về danh sách rỗng
        if (!videosData?.success || !videosData.data) {
            console.warn("Failed to fetch initial videos:", videosData?.error);
            return {
                playlist: playlistData.data,
                initialVideos: [],
                initialIsOverVideo: true,
                error: videosData?.error
            };
        }

        // Trả về dữ liệu playlist và danh sách video ban đầu
        return {
            playlist: playlistData.data,
            initialVideos: videosData.data.videos || [],
            initialIsOverVideo: videosData.data.isOverVideo,
            error: null
        };

    } catch (error) {
        console.error("Error fetching initial data:", error);
        let errorMessage = 'Failed to load playlist data.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        // Trả về lỗi nếu xảy ra exception
        return {
            playlist: null,
            initialVideos: [],
            initialIsOverVideo: true,
            error: errorMessage
        };
    }
}

// Component chính cho trang playlist (đây là một Server Component)
export default async function PlaylistPage({ searchParams }: PlaylistPageProps) {
    const resolvedSearchParams = await searchParams;
    const playlistId = typeof resolvedSearchParams.list === 'string' ? resolvedSearchParams.list : null;

    // Gọi hàm fetch dữ liệu ban đầu
    const { playlist, initialVideos, initialIsOverVideo, error } = await getInitialData(playlistId);

    // Nếu có lỗi hoặc không có playlist, hiển thị giao diện thông báo lỗi
    if (error || !playlist) {
        return (
            <main className="main">
                <div className="error-message">
                    <h1>Error</h1>
                    <p>{error || 'Playlist not found or could not be loaded.'}</p>
                    {/* Có thể thêm link quay lại trang chủ */}
                </div>
            </main>
        );
    }

    // Nếu mọi thứ hợp lệ, render Client Component và truyền dữ liệu ban đầu
    return (
        <PlaylistClientContent
            playlist={playlist}
            initialVideos={initialVideos}
            initialIsOverVideo={initialIsOverVideo}
            playlistId={playlistId!} // PlaylistId chắc chắn không null vì đã kiểm tra phía trên
            initialPageSize={INITIAL_PAGE_SIZE}
        ></PlaylistClientContent>
    );
}
