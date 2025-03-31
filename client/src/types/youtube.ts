
export type Playlist = {
    PlaylistId: string;
    Title: string;
    PublishedAt: string;
    Thumbnails: string;
    ChannelId: string;
    ChannelTitle: string;
    ItemCount: number;
}

export type Channel = {
    ChannelId: string;
    Title: string;
    Thumbnails: string;
    SubscriberCount: number;
    ViewCount: number;
}

export type Video = {
    playlistItemId: string;
    VideoId: string;
    VideoTitle: string;
    ChannelId: string;
    ChannelTitle: string;
    ViewCount: string;
    PublishedAt: string;
    Thumbnails: string;
    Duration: string;
    AddedAt: string;
    IndexVideo: number;
}