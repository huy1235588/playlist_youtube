use crate::core::db::Database;
use crate::features::playlists::model::Channel;
use crate::features::videos::model::{SortColumn, SortOrder, Video, VideoItemView};
use rusqlite::params;

impl Database {
    /// Lấy video phân trang và sắp xếp (thay thế Stored Procedure `[Get 50 Videos By Sort Column]`)
    pub fn get_videos_paginated(
        &self,
        playlist_id: &str,
        page_number: usize,
        page_size: usize,
        sort_column: SortColumn,
        sort_order: SortOrder,
    ) -> Result<(Vec<VideoItemView>, usize), String> {
        let conn = self.connect()?;
        let total: usize = conn
            .query_row(
                "SELECT COUNT(*) FROM PlaylistItems WHERE PlaylistId = ?1",
                params![playlist_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let offset = page_number.saturating_sub(1) * page_size;
        let sql = format!(
            "SELECT pi.Id, v.VideoId, v.Title, c.ChannelId, COALESCE(c.Title, ''),
                    v.ViewCount, v.PublishedAt, v.Thumbnails, v.Duration, COALESCE(pi.AddedAt, ''), COALESCE(pi.IndexVideo, 0)
             FROM PlaylistItems pi
             INNER JOIN Videos v ON pi.VideoId = v.VideoId
             LEFT JOIN Channels c ON v.ChannelId = c.ChannelId
             WHERE pi.PlaylistId = ?1
             ORDER BY {} {}
             LIMIT ?2 OFFSET ?3",
            sort_column.sql_expr(),
            sort_order.sql_keyword()
        );

        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map(params![playlist_id, page_size as i64, offset as i64], |row| {
                Ok(VideoItemView {
                    playlist_item_id: row.get(0)?,
                    video_id: row.get(1)?,
                    video_title: row.get(2)?,
                    channel_id: row.get(3)?,
                    channel_title: row.get(4)?,
                    view_count: row.get(5)?,
                    published_at: row.get(6)?,
                    thumbnails: row.get(7)?,
                    duration: row.get(8)?,
                    added_at: row.get(9)?,
                    index_video: row.get(10)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut videos = Vec::new();
        for r in rows {
            videos.push(r.map_err(|e| e.to_string())?);
        }

        Ok((videos, total))
    }

    /// Tìm kiếm video theo tiêu đề (thay thế Stored Procedure `[Search 50 Videos By TitleVideo]`)
    pub fn search_videos(
        &self,
        playlist_id: &str,
        search_input: &str,
        page_number: usize,
        page_size: usize,
    ) -> Result<(Vec<VideoItemView>, usize), String> {
        let conn = self.connect()?;
        let pattern = format!("%{}%", search_input.trim());

        let total: usize = conn
            .query_row(
                "SELECT COUNT(*)
                 FROM PlaylistItems pi
                 INNER JOIN Videos v ON pi.VideoId = v.VideoId
                 WHERE pi.PlaylistId = ?1 AND (v.Title LIKE ?2 OR v.VideoId LIKE ?2)",
                params![playlist_id, pattern],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        let offset = page_number.saturating_sub(1) * page_size;
        let mut stmt = conn
            .prepare(
                "SELECT pi.Id, v.VideoId, v.Title, c.ChannelId, COALESCE(c.Title, ''),
                        v.ViewCount, v.PublishedAt, v.Thumbnails, v.Duration, COALESCE(pi.AddedAt, ''), COALESCE(pi.IndexVideo, 0)
                 FROM PlaylistItems pi
                 INNER JOIN Videos v ON pi.VideoId = v.VideoId
                 LEFT JOIN Channels c ON v.ChannelId = c.ChannelId
                 WHERE pi.PlaylistId = ?1 AND (v.Title LIKE ?2 OR v.VideoId LIKE ?2)
                 ORDER BY v.Title ASC
                 LIMIT ?3 OFFSET ?4",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(
                params![playlist_id, pattern, page_size as i64, offset as i64],
                |row| {
                    Ok(VideoItemView {
                        playlist_item_id: row.get(0)?,
                        video_id: row.get(1)?,
                        video_title: row.get(2)?,
                        channel_id: row.get(3)?,
                        channel_title: row.get(4)?,
                        view_count: row.get(5)?,
                        published_at: row.get(6)?,
                        thumbnails: row.get(7)?,
                        duration: row.get(8)?,
                        added_at: row.get(9)?,
                        index_video: row.get(10)?,
                    })
                },
            )
            .map_err(|e| e.to_string())?;

        let mut videos = Vec::new();
        for r in rows {
            videos.push(r.map_err(|e| e.to_string())?);
        }

        Ok((videos, total))
    }

    /// Lấy danh sách video bị ẩn / bị xóa trên YouTube (thay thế `[Get Hidden Video Procedure]`)
    pub fn get_hidden_videos(&self, playlist_id: &str) -> Result<Vec<VideoItemView>, String> {
        let conn = self.connect()?;
        let mut stmt = conn
            .prepare(
                "SELECT pi.Id, v.VideoId, v.Title, c.ChannelId, c.Title,
                        v.ViewCount, v.PublishedAt, v.Thumbnails, v.Duration, COALESCE(pi.AddedAt, ''), COALESCE(pi.IndexVideo, 0)
                 FROM PlaylistItems pi
                 INNER JOIN Videos v ON pi.VideoId = v.VideoId
                 LEFT JOIN Channels c ON v.ChannelId = c.ChannelId
                 WHERE pi.PlaylistId = ?1 AND (v.Title IS NULL OR v.Duration IS NULL)
                 ORDER BY pi.AddedAt DESC",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![playlist_id], |row| {
                Ok(VideoItemView {
                    playlist_item_id: row.get(0)?,
                    video_id: row.get(1)?,
                    video_title: row.get(2)?,
                    channel_id: row.get(3)?,
                    channel_title: row.get(4)?,
                    view_count: row.get(5)?,
                    published_at: row.get(6)?,
                    thumbnails: row.get(7)?,
                    duration: row.get(8)?,
                    added_at: row.get(9)?,
                    index_video: row.get(10)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut videos = Vec::new();
        for r in rows {
            videos.push(r.map_err(|e| e.to_string())?);
        }
        Ok(videos)
    }

    /// Xóa video khỏi PlaylistItems và Videos (thay thế DeleteModel.deleteByVideoId)
    pub fn delete_video(&self, video_id: &str) -> Result<(), String> {
        let mut conn = self.connect()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        tx.execute(
            "DELETE FROM PlaylistItems WHERE VideoId = ?1",
            params![video_id],
        )
        .map_err(|e| format!("Lỗi xóa khỏi PlaylistItems: {e}"))?;

        tx.execute("DELETE FROM Videos WHERE VideoId = ?1", params![video_id])
            .map_err(|e| format!("Lỗi xóa khỏi Videos: {e}"))?;

        tx.commit().map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Thay thế một video (ví dụ video bị ẩn/xóa) trong PlaylistItem bằng video mới
    pub fn replace_video_in_playlist(
        &self,
        playlist_item_id: &str,
        new_video: &Video,
        new_channel: Option<&Channel>,
    ) -> Result<(), String> {
        let mut conn = self.connect()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        if let Some(ch) = new_channel {
            Self::upsert_channel_tx(&tx, ch)?;
        }
        Self::upsert_video_tx(&tx, new_video)?;

        tx.execute(
            "UPDATE PlaylistItems SET VideoId = ?1 WHERE Id = ?2",
            params![new_video.video_id, playlist_item_id],
        )
        .map_err(|e| format!("Lỗi cập nhật PlaylistItem khi thay thế video: {e}"))?;

        tx.commit().map_err(|e| e.to_string())?;
        Ok(())
    }
}
