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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Video {
    pub video_id: String,
    pub title: Option<String>,
    pub published_at: Option<String>,
    pub thumbnails: Option<String>,
    pub view_count: Option<i64>,
    pub duration: Option<String>,
    pub channel_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistItem {
    pub id: String,
    pub video_id: String,
    pub playlist_id: String,
    pub added_at: String,
    pub index_video: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoItemView {
    pub playlist_item_id: String,
    pub video_id: String,
    pub video_title: Option<String>,
    pub channel_id: Option<String>,
    pub channel_title: Option<String>,
    pub view_count: Option<i64>,
    pub published_at: Option<String>,
    pub thumbnails: Option<String>,
    pub duration: Option<String>,
    pub added_at: String,
    pub index_video: i32,
}

impl VideoItemView {
    pub fn is_hidden_or_deleted(&self) -> bool {
        self.video_title.is_none() || self.duration.is_none()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum SortColumn {
    #[default]
    AddedAt,
    PublishedAt,
    ViewCount,
    Duration,
    IndexVideo,
}

impl SortColumn {
    pub fn label(self) -> &'static str {
        match self {
            SortColumn::AddedAt => "Ngày thêm (AddedAt)",
            SortColumn::PublishedAt => "Ngày đăng (PublishedAt)",
            SortColumn::ViewCount => "Lượt xem (ViewCount)",
            SortColumn::Duration => "Thời lượng (Duration)",
            SortColumn::IndexVideo => "Thứ tự (Index)",
        }
    }

    pub fn sql_expr(self) -> &'static str {
        match self {
            SortColumn::AddedAt => "pi.AddedAt",
            SortColumn::PublishedAt => "v.PublishedAt",
            SortColumn::ViewCount => "COALESCE(v.ViewCount, 0)",
            SortColumn::Duration => "v.Duration",
            SortColumn::IndexVideo => "pi.IndexVideo",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum SortOrder {
    Asc,
    #[default]
    Desc,
}

impl SortOrder {
    pub fn sql_keyword(self) -> &'static str {
        match self {
            SortOrder::Asc => "ASC",
            SortOrder::Desc => "DESC",
        }
    }

    pub fn toggle(self) -> Self {
        match self {
            SortOrder::Asc => SortOrder::Desc,
            SortOrder::Desc => SortOrder::Asc,
        }
    }
}

/// Chuyển đổi số lượt xem sang định dạng K, M, B giống VideoYoutube.vue
pub fn format_view_count(count: Option<i64>) -> String {
    let Some(c) = count else {
        return "0".to_string();
    };
    if c >= 1_000_000_000 {
        if c >= 10_000_000_000 {
            format!("{} B", c / 1_000_000_000)
        } else {
            format!("{:.1} B", c as f64 / 1_000_000_000.0)
        }
    } else if c >= 1_000_000 {
        if c >= 10_000_000 {
            format!("{} M", c / 1_000_000)
        } else {
            format!("{:.1} M", c as f64 / 1_000_000.0)
        }
    } else if c >= 1_000 {
        if c >= 10_000 {
            format!("{} K", c / 1_000)
        } else {
            format!("{:.1} K", c as f64 / 1_000.0)
        }
    } else {
        c.to_string()
    }
}

/// Chuyển đổi thời lượng ISO-8601 (VD: PT1H2M10S, PT4M5S) sang H:MM:SS hoặc M:SS
pub fn format_duration(duration: Option<&str>) -> String {
    let Some(raw) = duration else {
        return "--:--".to_string();
    };
    if !raw.starts_with("PT") {
        return raw.to_string();
    }

    let mut hours: u32 = 0;
    let mut minutes: u32 = 0;
    let mut seconds: u32 = 0;
    let mut current_num = String::new();

    for ch in raw[2..].chars() {
        if ch.is_ascii_digit() {
            current_num.push(ch);
        } else {
            let val = current_num.parse::<u32>().unwrap_or(0);
            current_num.clear();
            match ch {
                'H' => hours = val,
                'M' => minutes = val,
                'S' => seconds = val,
                _ => {}
            }
        }
    }

    if hours > 0 {
        format!("{hours}:{minutes:02}:{seconds:02}")
    } else {
        format!("{minutes}:{seconds:02}")
    }
}

/// Làm gọn chuỗi thời gian ISO-8601 thành YYYY-MM-DD
pub fn format_short_date(date_str: Option<&str>) -> String {
    let Some(s) = date_str else {
        return "N/A".to_string();
    };
    s.split(['T', ' ']).next().unwrap_or(s).to_string()
}
