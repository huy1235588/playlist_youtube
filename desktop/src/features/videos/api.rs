use crate::core::youtube_client::{ApiListResponse, Thumbnails, YOUTUBE_API_BASE_URL};
use crate::features::playlists::api::get_channels_batch;
use crate::features::playlists::model::Channel;
use crate::features::videos::model::Video;
use reqwest::Client;
use serde::Deserialize;
use std::collections::{HashMap, HashSet};

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
