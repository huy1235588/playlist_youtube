use serde::{Deserialize, Serialize};

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
