use crate::models::{Channel, Playlist, PlaylistItem, Video};
use reqwest::Client;
use serde::Deserialize;
use std::collections::{HashMap, HashSet};

const YOUTUBE_API_BASE_URL: &str = "https://www.googleapis.com/youtube/v3";

#[derive(Debug, Clone)]
pub struct PlaylistBundle {
    pub playlist: Playlist,
    pub playlist_channel: Option<Channel>,
    pub channels: Vec<Channel>,
    pub videos: Vec<Video>,
    pub items: Vec<PlaylistItem>,
}

/// Trích xuất Playlist ID từ URL hoặc chuỗi trực tiếp
pub fn extract_playlist_id(input: &str) -> Option<String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }
    if let Some(idx) = trimmed.find("list=") {
        let after = &trimmed[idx + 5..];
        let id = after.split(['&', '#', ' ']).next().unwrap_or("").trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }
    if !trimmed.contains('/') && !trimmed.contains('?') && trimmed.len() >= 10 {
        return Some(trimmed.to_string());
    }
    None
}

/// Trích xuất Video ID từ URL hoặc chuỗi trực tiếp
pub fn extract_video_id(input: &str) -> Option<String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }
    if let Some(idx) = trimmed.find("v=") {
        let after = &trimmed[idx + 2..];
        let id = after.split(['&', '#', ' ']).next().unwrap_or("").trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }
    if let Some(idx) = trimmed.find("youtu.be/") {
        let after = &trimmed[idx + 9..];
        let id = after
            .split(['?', '&', '#', '/'])
            .next()
            .unwrap_or("")
            .trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }
    if !trimmed.contains('/') && !trimmed.contains('?') && trimmed.len() >= 8 {
        return Some(trimmed.to_string());
    }
    None
}

#[derive(Debug, Deserialize)]
#[serde(bound(deserialize = "T: Deserialize<'de>"))]
struct ApiListResponse<T> {
    #[serde(default)]
    items: Vec<T>,
    #[serde(rename = "nextPageToken")]
    next_page_token: Option<String>,
    #[serde(rename = "pageInfo")]
    page_info: Option<PageInfo>,
}

#[derive(Debug, Deserialize)]
struct PageInfo {
    #[serde(rename = "totalResults")]
    total_results: Option<i32>,
}

#[derive(Debug, Deserialize)]
struct Thumbnails {
    high: Option<ThumbnailUrl>,
    medium: Option<ThumbnailUrl>,
    default: Option<ThumbnailUrl>,
}

impl Thumbnails {
    fn best_url(&self) -> Option<String> {
        self.high
            .as_ref()
            .or(self.medium.as_ref())
            .or(self.default.as_ref())
            .map(|t| t.url.clone())
    }
}

#[derive(Debug, Deserialize)]
struct ThumbnailUrl {
    url: String,
}

#[derive(Debug, Deserialize)]
struct RawPlaylist {
    id: String,
    snippet: Option<RawPlaylistSnippet>,
    #[serde(rename = "contentDetails")]
    content_details: Option<RawPlaylistContentDetails>,
}

#[derive(Debug, Deserialize)]
struct RawPlaylistSnippet {
    title: Option<String>,
    #[serde(rename = "publishedAt")]
    published_at: Option<String>,
    thumbnails: Option<Thumbnails>,
    #[serde(rename = "channelId")]
    channel_id: Option<String>,
    #[serde(rename = "channelTitle")]
    channel_title: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RawPlaylistContentDetails {
    #[serde(rename = "itemCount")]
    item_count: Option<i32>,
}

#[derive(Debug, Deserialize)]
struct RawChannel {
    id: String,
    snippet: Option<RawChannelSnippet>,
    statistics: Option<RawChannelStats>,
}

#[derive(Debug, Deserialize)]
struct RawChannelSnippet {
    title: Option<String>,
    thumbnails: Option<Thumbnails>,
}

#[derive(Debug, Deserialize)]
struct RawChannelStats {
    #[serde(rename = "subscriberCount")]
    subscriber_count: Option<String>,
    #[serde(rename = "videoCount")]
    video_count: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RawVideo {
    id: String,
    snippet: Option<RawVideoSnippet>,
    #[serde(rename = "contentDetails")]
    content_details: Option<RawVideoContentDetails>,
    statistics: Option<RawVideoStats>,
}

#[derive(Debug, Deserialize)]
struct RawVideoSnippet {
    title: Option<String>,
    #[serde(rename = "publishedAt")]
    published_at: Option<String>,
    thumbnails: Option<Thumbnails>,
    #[serde(rename = "channelId")]
    channel_id: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RawVideoContentDetails {
    duration: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RawVideoStats {
    #[serde(rename = "viewCount")]
    view_count: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RawPlaylistItem {
    id: String,
    snippet: Option<RawPlaylistItemSnippet>,
    #[serde(rename = "contentDetails")]
    content_details: Option<RawPlaylistItemContentDetails>,
}

#[derive(Debug, Deserialize)]
struct RawPlaylistItemSnippet {
    #[serde(rename = "publishedAt")]
    published_at: Option<String>,
    #[serde(rename = "videoOwnerChannelId")]
    video_owner_channel_id: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RawPlaylistItemContentDetails {
    #[serde(rename = "videoId")]
    video_id: Option<String>,
}

pub async fn get_playlist_details(
    client: &Client,
    api_key: &str,
    playlist_id: &str,
) -> Result<Playlist, String> {
    let resp = client
        .get(format!("{YOUTUBE_API_BASE_URL}/playlists"))
        .query(&[
            ("part", "snippet,contentDetails"),
            ("id", playlist_id),
            ("key", api_key),
        ])
        .send()
        .await
        .map_err(|e| format!("Lỗi kết nối YouTube API (playlists): {e}"))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("YouTube API trả về lỗi {status}: {text}"));
    }

    let parsed: ApiListResponse<RawPlaylist> = resp
        .json()
        .await
        .map_err(|e| format!("Lỗi đọc JSON playlist: {e}"))?;

    let item = parsed
        .items
        .into_iter()
        .next()
        .ok_or_else(|| format!("Không tìm thấy Playlist với ID '{playlist_id}' trên YouTube"))?;

    let snippet = item.snippet;
    let content_details = item.content_details;

    Ok(Playlist {
        playlist_id: item.id,
        title: snippet.as_ref().and_then(|s| s.title.clone()),
        published_at: snippet.as_ref().and_then(|s| s.published_at.clone()),
        thumbnails: snippet
            .as_ref()
            .and_then(|s| s.thumbnails.as_ref())
            .and_then(|t| t.best_url()),
        channel_id: snippet.as_ref().and_then(|s| s.channel_id.clone()),
        channel_title: snippet.as_ref().and_then(|s| s.channel_title.clone()),
        item_count: content_details.and_then(|c| c.item_count).unwrap_or(0),
    })
}

pub async fn get_channels_batch(
    client: &Client,
    api_key: &str,
    channel_ids: &[String],
) -> Result<Vec<Channel>, String> {
    let mut result = Vec::new();
    for chunk in channel_ids.chunks(50) {
        if chunk.is_empty() {
            continue;
        }
        let ids_joined = chunk.join(",");
        let resp = client
            .get(format!("{YOUTUBE_API_BASE_URL}/channels"))
            .query(&[
                ("part", "snippet,statistics"),
                ("id", ids_joined.as_str()),
                ("key", api_key),
            ])
            .send()
            .await
            .map_err(|e| format!("Lỗi kết nối YouTube API (channels): {e}"))?;

        if !resp.status().is_success() {
            continue;
        }

        let parsed: ApiListResponse<RawChannel> = resp
            .json()
            .await
            .map_err(|e| format!("Lỗi đọc JSON channels: {e}"))?;

        for ch in parsed.items {
            let snippet = ch.snippet;
            let stats = ch.statistics;
            result.push(Channel {
                channel_id: ch.id,
                title: snippet.as_ref().and_then(|s| s.title.clone()),
                thumbnails: snippet
                    .as_ref()
                    .and_then(|s| s.thumbnails.as_ref())
                    .and_then(|t| t.best_url()),
                subscriber_count: stats
                    .as_ref()
                    .and_then(|s| s.subscriber_count.as_deref())
                    .and_then(|v| v.parse::<i64>().ok()),
                video_count: stats
                    .as_ref()
                    .and_then(|s| s.video_count.as_deref())
                    .and_then(|v| v.parse::<i64>().ok()),
            });
        }
    }
    Ok(result)
}

pub async fn get_videos_batch(
    client: &Client,
    api_key: &str,
    video_ids: &[String],
) -> Result<Vec<Video>, String> {
    let mut found_map: HashMap<String, Video> = HashMap::new();

    for chunk in video_ids.chunks(50) {
        if chunk.is_empty() {
            continue;
        }
        let ids_joined = chunk.join(",");
        let resp = client
            .get(format!("{YOUTUBE_API_BASE_URL}/videos"))
            .query(&[
                ("part", "snippet,contentDetails,statistics"),
                ("id", ids_joined.as_str()),
                ("key", api_key),
            ])
            .send()
            .await
            .map_err(|e| format!("Lỗi kết nối YouTube API (videos): {e}"))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            return Err(format!("YouTube API (videos) trả về lỗi {status}: {text}"));
        }

        let parsed: ApiListResponse<RawVideo> = resp
            .json()
            .await
            .map_err(|e| format!("Lỗi đọc JSON videos: {e}"))?;

        for v in parsed.items {
            let snippet = v.snippet;
            let content = v.content_details;
            let stats = v.statistics;
            found_map.insert(
                v.id.clone(),
                Video {
                    video_id: v.id,
                    title: snippet.as_ref().and_then(|s| s.title.clone()),
                    published_at: snippet.as_ref().and_then(|s| s.published_at.clone()),
                    thumbnails: snippet
                        .as_ref()
                        .and_then(|s| s.thumbnails.as_ref())
                        .and_then(|t| t.best_url()),
                    view_count: stats
                        .as_ref()
                        .and_then(|s| s.view_count.as_deref())
                        .and_then(|val| val.parse::<i64>().ok()),
                    duration: content.and_then(|c| c.duration),
                    channel_id: snippet.and_then(|s| s.channel_id),
                },
            );
        }
    }

    // Bảo toàn cả các video đã bị ẩn/xóa (title = None, duration = None) giống youtubeService.js
    let mut all_videos = Vec::with_capacity(video_ids.len());
    let mut seen = HashSet::new();
    for vid_id in video_ids {
        if !seen.insert(vid_id.clone()) {
            continue;
        }
        if let Some(v) = found_map.remove(vid_id) {
            all_videos.push(v);
        } else {
            all_videos.push(Video {
                video_id: vid_id.clone(),
                title: None,
                published_at: None,
                thumbnails: None,
                view_count: None,
                duration: None,
                channel_id: None,
            });
        }
    }

    Ok(all_videos)
}

/// Lấy toàn bộ Playlist + Channels + Videos + PlaylistItems
pub async fn fetch_playlist_bundle(
    api_key: &str,
    playlist_id: &str,
    stop_at_video_id: Option<&str>,
) -> Result<PlaylistBundle, String> {
    if api_key.trim().is_empty() {
        return Err(
            "Chưa cấu hình YOUTUBE_API_KEY. Hãy bấm nút 'API Key' trên thanh công cụ để nhập."
                .to_string(),
        );
    }

    let client = Client::new();
    let playlist = get_playlist_details(&client, api_key, playlist_id).await?;

    let playlist_channel = if let Some(ref ch_id) = playlist.channel_id {
        get_channels_batch(&client, api_key, std::slice::from_ref(ch_id))
            .await?
            .into_iter()
            .next()
    } else {
        None
    };

    let mut next_page_token: Option<String> = None;
    let mut total_results: i32 = playlist.item_count;
    let mut raw_entries: Vec<(String, String, String, Option<String>)> = Vec::new();
    let mut stop_reached = false;

    loop {
        let mut req = client
            .get(format!("{YOUTUBE_API_BASE_URL}/playlistItems"))
            .query(&[
                ("part", "snippet,contentDetails"),
                ("maxResults", "50"),
                ("playlistId", playlist_id),
                ("key", api_key),
            ]);

        if let Some(ref token) = next_page_token {
            req = req.query(&[("pageToken", token.as_str())]);
        }

        let resp = req
            .send()
            .await
            .map_err(|e| format!("Lỗi kết nối YouTube API (playlistItems): {e}"))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            return Err(format!(
                "YouTube API (playlistItems) trả về lỗi {status}: {text}"
            ));
        }

        let parsed: ApiListResponse<RawPlaylistItem> = resp
            .json()
            .await
            .map_err(|e| format!("Lỗi đọc JSON playlistItems: {e}"))?;

        if let Some(total) = parsed.page_info.and_then(|p| p.total_results) {
            total_results = total;
        }

        for item in parsed.items {
            let Some(video_id) = item.content_details.and_then(|c| c.video_id) else {
                continue;
            };

            if let Some(stop_id) = stop_at_video_id
                && video_id == stop_id
            {
                stop_reached = true;
                break;
            }

            let added_at = item
                .snippet
                .as_ref()
                .and_then(|s| s.published_at.clone())
                .unwrap_or_default();
            let owner_channel_id = item
                .snippet
                .and_then(|s| s.video_owner_channel_id)
                .filter(|s| !s.is_empty());

            raw_entries.push((item.id, video_id, added_at, owner_channel_id));
        }

        if stop_reached || parsed.next_page_token.is_none() {
            break;
        }
        next_page_token = parsed.next_page_token;
    }

    // Thu thập danh sách ChannelId duy nhất và VideoId
    let mut channel_id_set = HashSet::new();
    let mut video_ids = Vec::with_capacity(raw_entries.len());
    for (_, vid_id, _, ch_id) in &raw_entries {
        video_ids.push(vid_id.clone());
        if let Some(cid) = ch_id {
            channel_id_set.insert(cid.clone());
        }
    }

    let channel_ids: Vec<String> = channel_id_set.into_iter().collect();
    let channels = get_channels_batch(&client, api_key, &channel_ids).await?;
    let mut videos = get_videos_batch(&client, api_key, &video_ids).await?;

    // Đảm bảo mọi channel_id xuất hiện trong video đều có bản ghi trong bảng Channels (tránh lỗi khoá ngoại)
    let known_channels: HashSet<String> = channels
        .iter()
        .map(|c| c.channel_id.clone())
        .chain(playlist_channel.iter().map(|c| c.channel_id.clone()))
        .collect();

    for v in &mut videos {
        if let Some(ref cid) = v.channel_id
            && !known_channels.contains(cid)
        {
            v.channel_id = None;
        }
    }

    // Đánh chỉ số IndexVideo giảm dần từ total_results giống hệt videoController.js
    let mut index_video = total_results.max(raw_entries.len() as i32);
    let mut items = Vec::with_capacity(raw_entries.len());
    for (id, video_id, added_at, _) in raw_entries {
        items.push(PlaylistItem {
            id,
            video_id,
            playlist_id: playlist_id.to_string(),
            added_at,
            index_video,
        });
        index_video -= 1;
    }

    Ok(PlaylistBundle {
        playlist,
        playlist_channel,
        channels,
        videos,
        items,
    })
}

/// Lấy thông tin 1 video duy nhất từ YouTube API (dùng cho chức năng Thay thế Video)
pub async fn fetch_single_video(
    api_key: &str,
    video_id: &str,
) -> Result<(Video, Option<Channel>), String> {
    if api_key.trim().is_empty() {
        return Err("Chưa cấu hình YOUTUBE_API_KEY.".to_string());
    }
    let client = Client::new();
    let videos = get_videos_batch(&client, api_key, &[video_id.to_string()]).await?;
    let video = videos
        .into_iter()
        .next()
        .ok_or_else(|| format!("Không tìm thấy video '{video_id}'"))?;

    if video.title.is_none() {
        return Err(format!(
            "Video '{video_id}' không tồn tại hoặc đang ở chế độ riêng tư."
        ));
    }

    let channel = if let Some(ref cid) = video.channel_id {
        get_channels_batch(&client, api_key, std::slice::from_ref(cid))
            .await?
            .into_iter()
            .next()
    } else {
        None
    };

    Ok((video, channel))
}
