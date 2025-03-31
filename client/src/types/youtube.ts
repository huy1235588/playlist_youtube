
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