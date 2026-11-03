use crate::features::videos::model::{PlaylistItem, Video};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Channel {
    pub channel_id: String,
    pub title: Option<String>,
    pub thumbnails: Option<String>,
    pub subscriber_count: Option<i64>,
    pub video_count: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Playlist {
    pub playlist_id: String,
    pub title: Option<String>,
    pub published_at: Option<String>,
    pub thumbnails: Option<String>,
    pub channel_id: Option<String>,
    pub channel_title: Option<String>,
    pub item_count: i32,
}

#[derive(Debug, Clone)]
pub struct PlaylistBundle {
    pub playlist: Playlist,
    pub playlist_channel: Option<Channel>,
    pub channels: Vec<Channel>,
    pub videos: Vec<Video>,
    pub items: Vec<PlaylistItem>,
}
