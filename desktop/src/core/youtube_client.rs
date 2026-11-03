use serde::Deserialize;

pub const YOUTUBE_API_BASE_URL: &str = "https://www.googleapis.com/youtube/v3";

#[derive(Debug, Deserialize)]
#[serde(bound(deserialize = "T: Deserialize<'de>"))]
pub struct ApiListResponse<T> {
    #[serde(default)]
    pub items: Vec<T>,
    #[serde(rename = "nextPageToken")]
    pub next_page_token: Option<String>,
    #[serde(rename = "pageInfo")]
    pub page_info: Option<PageInfo>,
}

#[derive(Debug, Deserialize)]
pub struct PageInfo {
    #[serde(rename = "totalResults")]
    pub total_results: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct Thumbnails {
    pub high: Option<ThumbnailUrl>,
    pub medium: Option<ThumbnailUrl>,
    pub default: Option<ThumbnailUrl>,
}

impl Thumbnails {
    pub fn best_url(&self) -> Option<String> {
        self.high
            .as_ref()
            .or(self.medium.as_ref())
            .or(self.default.as_ref())
            .map(|t| t.url.clone())
    }
}

#[derive(Debug, Deserialize)]
pub struct ThumbnailUrl {
    pub url: String,
}
