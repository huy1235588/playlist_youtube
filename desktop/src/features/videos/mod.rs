pub mod api;
pub mod model;
pub mod repo;
pub mod view;

use crate::core::db::Database;
use crate::features::videos::model::{SortColumn, SortOrder, VideoItemView};

pub const PAGE_SIZE: usize = 48;

pub struct VideosState {
    pub videos: Vec<VideoItemView>,
    pub hidden_count: usize,
    pub total_videos: usize,
    pub search_query: String,
    pub sort_column: SortColumn,
    pub sort_order: SortOrder,
    pub show_hidden_only: bool,
    pub current_page: usize,
    pub replace_video_input: String,
}

impl Default for VideosState {
    fn default() -> Self {
        Self::new()
    }
}

impl VideosState {
    pub fn new() -> Self {
        Self {
            videos: Vec::new(),
            hidden_count: 0,
            total_videos: 0,
            search_query: String::new(),
            sort_column: SortColumn::AddedAt,
            sort_order: SortOrder::Desc,
            show_hidden_only: false,
            current_page: 1,
            replace_video_input: String::new(),
        }
    }

    pub fn reset_for_playlist(&mut self) {
        self.current_page = 1;
        self.search_query.clear();
        self.show_hidden_only = false;
    }

    pub fn clear(&mut self) {
        self.videos.clear();
        self.total_videos = 0;
        self.hidden_count = 0;
        self.search_query.clear();
        self.show_hidden_only = false;
        self.current_page = 1;
    }

    pub fn total_pages(&self) -> usize {
        if self.show_hidden_only || self.total_videos == 0 {
            1
        } else {
            self.total_videos.div_ceil(PAGE_SIZE)
        }
    }

    pub fn reload(&mut self, db: &Database, playlist_id: Option<&str>) -> Result<(), String> {
        let Some(pid) = playlist_id else {
            self.videos.clear();
            self.total_videos = 0;
            self.hidden_count = 0;
            return Ok(());
        };

        self.hidden_count = db.get_hidden_videos(pid).map(|v| v.len()).unwrap_or(0);

        if self.show_hidden_only {
            let list = db.get_hidden_videos(pid)?;
            self.total_videos = list.len();
            self.videos = list;
            return Ok(());
        }

        let (list, total) = if !self.search_query.trim().is_empty() {
            db.search_videos(pid, &self.search_query, self.current_page, PAGE_SIZE)?
        } else {
            db.get_videos_paginated(
                pid,
                self.current_page,
                PAGE_SIZE,
                self.sort_column,
                self.sort_order,
            )?
        };

        self.videos = list;
        self.total_videos = total;
        Ok(())
    }
}
