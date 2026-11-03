use iced::widget::image::{Handle, Image};
use iced::{ContentFit, Element, Length};
use reqwest::Client;
use shadcn_iced::aspect_ratio::aspect_ratio;
use std::collections::{HashMap, HashSet};

const FALLBACK_THUMBNAIL_BYTES: &[u8] =
    include_bytes!("../../../client/public/images/no_thumbnail.jpg");

pub struct ThumbnailCache {
    client: Client,
    fallback: Handle,
    loaded: HashMap<String, Handle>,
    attempted: HashSet<String>,
}

impl Default for ThumbnailCache {
    fn default() -> Self {
        Self::new()
    }
}

impl ThumbnailCache {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            fallback: Handle::from_bytes(FALLBACK_THUMBNAIL_BYTES),
            loaded: HashMap::new(),
            attempted: HashSet::new(),
        }
    }

    pub fn client(&self) -> Client {
        self.client.clone()
    }

    pub fn handle_for(&self, url: Option<&str>) -> Handle {
        if let Some(u) = url.map(str::trim).filter(|s| !s.is_empty())
            && let Some(handle) = self.loaded.get(u)
        {
            return handle.clone();
        }
        self.fallback.clone()
    }

    /// Ảnh thu nhỏ kích thước cố định (dùng cho chế độ List và Top Bar)
    pub fn view_thumbnail<'a, Message: 'a>(
        &self,
        url: Option<&str>,
        width: f32,
        height: f32,
    ) -> Element<'a, Message> {
        Image::new(self.handle_for(url))
            .width(Length::Fixed(width))
            .height(Length::Fixed(height))
            .content_fit(ContentFit::Cover)
            .border_radius(8.0)
            .into()
    }

    /// Ảnh bìa co giãn tỉ lệ 16:9 tràn viền trên của Card (dùng cho chế độ Grid)
    pub fn view_media_thumbnail<'a, Message: 'a>(&self, url: Option<&str>) -> Element<'a, Message> {
        aspect_ratio(
            16.0 / 9.0,
            Image::new(self.handle_for(url))
                .width(Length::Fill)
                .height(Length::Fill)
                .content_fit(ContentFit::Cover),
        )
        .into()
    }

    /// Lọc ra danh sách URL ảnh bìa chưa từng được tải trong phiên làm việc
    pub fn take_unloaded_urls(
        &mut self,
        urls: impl IntoIterator<Item = Option<String>>,
    ) -> Vec<String> {
        let mut to_fetch = Vec::new();
        for url in urls.into_iter().flatten() {
            let trimmed = url.trim().to_string();
            if trimmed.is_empty()
                || self.loaded.contains_key(&trimmed)
                || !self.attempted.insert(trimmed.clone())
            {
                continue;
            }
            to_fetch.push(trimmed);
        }
        to_fetch
    }

    pub fn on_thumbnail_fetched(&mut self, url: String, bytes: Option<Vec<u8>>) {
        if let Some(data) = bytes
            && !data.is_empty()
        {
            self.loaded.insert(url, Handle::from_bytes(data));
        }
    }
}

pub async fn download_thumbnail_bytes(client: Client, url: String) -> (String, Option<Vec<u8>>) {
    let bytes = match client.get(&url).send().await {
        Ok(resp) if resp.status().is_success() => resp.bytes().await.ok().map(|b| b.to_vec()),
        _ => None,
    };
    (url, bytes)
}
