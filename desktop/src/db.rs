use crate::models::{Channel, Playlist, PlaylistItem, SortColumn, SortOrder, Video, VideoItemView};
use rusqlite::{Connection, OptionalExtension, params};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct Database {
    db_path: PathBuf,
}

impl Database {
    pub fn new(path: impl AsRef<Path>) -> Result<Self, String> {
        let db = Self {
            db_path: path.as_ref().to_path_buf(),
        };
        db.init_schema()?;
        Ok(db)
    }

    fn connect(&self) -> Result<Connection, String> {
        let conn = Connection::open(&self.db_path)
            .map_err(|e| format!("Không thể mở SQLite DB ({:?}): {e}", self.db_path))?;
        conn.execute_batch("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")
            .map_err(|e| format!("Lỗi cấu hình PRAGMA SQLite: {e}"))?;
        Ok(conn)
    }

    /// Khởi tạo toàn bộ bảng và Index tương ứng với createDataBase.sql
    pub fn init_schema(&self) -> Result<(), String> {
        let conn = self.connect()?;
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS Channels (
                ChannelId TEXT PRIMARY KEY,
                Title TEXT NULL,
                Thumbnails TEXT NULL,
                SubscriberCount INTEGER NULL,
                VideoCount INTEGER NULL
            );

            CREATE TABLE IF NOT EXISTS Playlists (
                PlaylistId TEXT PRIMARY KEY,
                Title TEXT NULL,
                PublishedAt TEXT NULL,
                Thumbnails TEXT NULL,
                ChannelId TEXT NULL,
                ChannelTitle TEXT NULL,
                ItemCount INTEGER DEFAULT 0,
                FOREIGN KEY (ChannelId) REFERENCES Channels(ChannelId)
            );

            CREATE TABLE IF NOT EXISTS Videos (
                VideoId TEXT PRIMARY KEY,
                Title TEXT NULL,
                PublishedAt TEXT NULL,
                Thumbnails TEXT NULL,
                ViewCount INTEGER NULL,
                Duration TEXT NULL,
                ChannelId TEXT NULL,
                FOREIGN KEY (ChannelId) REFERENCES Channels(ChannelId)
            );

            CREATE TABLE IF NOT EXISTS PlaylistItems (
                Id TEXT PRIMARY KEY NOT NULL,
                VideoId TEXT NOT NULL,
                PlaylistId TEXT NOT NULL,
                AddedAt TEXT NULL,
                IndexVideo INTEGER DEFAULT 0,
                FOREIGN KEY (VideoId) REFERENCES Videos(VideoId),
                FOREIGN KEY (PlaylistId) REFERENCES Playlists(PlaylistId)
            );

            CREATE INDEX IF NOT EXISTS IX_Videos_ChannelId ON Videos(ChannelId);
            CREATE INDEX IF NOT EXISTS IX_PlaylistItems_PlaylistId ON PlaylistItems(PlaylistId);
            CREATE INDEX IF NOT EXISTS IX_PlaylistItems_AddedAt ON PlaylistItems(AddedAt);
            ",
        )
        .map_err(|e| format!("Lỗi khởi tạo bảng SQLite: {e}"))?;
        Ok(())
    }

    pub fn check_existing_playlist(&self, playlist_id: &str) -> Result<bool, String> {
        let conn = self.connect()?;
        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM Playlists WHERE PlaylistId = ?1",
                params![playlist_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;
        Ok(count > 0)
    }

    pub fn get_playlists(&self) -> Result<Vec<Playlist>, String> {
        let conn = self.connect()?;
        let mut stmt = conn
            .prepare(
                "SELECT PlaylistId, Title, PublishedAt, Thumbnails, ChannelId, ChannelTitle, COALESCE(ItemCount, 0)
                 FROM Playlists
                 ORDER BY PublishedAt DESC",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| {
                Ok(Playlist {
                    playlist_id: row.get(0)?,
                    title: row.get(1)?,
                    published_at: row.get(2)?,
                    thumbnails: row.get(3)?,
                    channel_id: row.get(4)?,
                    channel_title: row.get(5)?,
                    item_count: row.get(6)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut playlists = Vec::new();
        for item in rows {
            playlists.push(item.map_err(|e| e.to_string())?);
        }
        Ok(playlists)
    }

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

    /// Lấy video mới nhất trong playlist để dùng khi Update Playlist
    pub fn get_latest_video_id(&self, playlist_id: &str) -> Result<Option<String>, String> {
        let conn = self.connect()?;
        conn.query_row(
            "SELECT VideoId FROM PlaylistItems WHERE PlaylistId = ?1 ORDER BY IndexVideo DESC LIMIT 1",
            params![playlist_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())
    }

    /// Lưu toàn bộ dữ liệu Playlist mới hoặc cập nhật bằng Transaction
    pub fn save_playlist_bundle(
        &self,
        playlist: &Playlist,
        playlist_channel: Option<&Channel>,
        channels: &[Channel],
        videos: &[Video],
        items: &[PlaylistItem],
        is_update: bool,
    ) -> Result<(), String> {
        let mut conn = self.connect()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        if let Some(ch) = playlist_channel {
            Self::upsert_channel_tx(&tx, ch)?;
        }

        if is_update {
            tx.execute(
                "UPDATE Playlists SET ItemCount = ?1, Title = COALESCE(?2, Title), Thumbnails = COALESCE(?3, Thumbnails) WHERE PlaylistId = ?4",
                params![
                    playlist.item_count,
                    playlist.title,
                    playlist.thumbnails,
                    playlist.playlist_id
                ],
            )
            .map_err(|e| format!("Lỗi cập nhật Playlist: {e}"))?;
        } else {
            tx.execute(
                "INSERT OR REPLACE INTO Playlists (PlaylistId, Title, PublishedAt, Thumbnails, ChannelId, ChannelTitle, ItemCount)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    playlist.playlist_id,
                    playlist.title,
                    playlist.published_at,
                    playlist.thumbnails,
                    playlist.channel_id,
                    playlist.channel_title,
                    playlist.item_count
                ],
            )
            .map_err(|e| format!("Lỗi thêm Playlist: {e}"))?;
        }

        for ch in channels {
            Self::upsert_channel_tx(&tx, ch)?;
        }

        for v in videos {
            Self::upsert_video_tx(&tx, v)?;
        }

        for item in items {
            tx.execute(
                "INSERT OR REPLACE INTO PlaylistItems (Id, VideoId, PlaylistId, AddedAt, IndexVideo)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![
                    item.id,
                    item.video_id,
                    item.playlist_id,
                    item.added_at,
                    item.index_video
                ],
            )
            .map_err(|e| format!("Lỗi thêm PlaylistItem: {e}"))?;
        }

        tx.commit().map_err(|e| e.to_string())?;
        Ok(())
    }

    fn upsert_channel_tx(tx: &rusqlite::Transaction<'_>, ch: &Channel) -> Result<(), String> {
        tx.execute(
            "INSERT OR REPLACE INTO Channels (ChannelId, Title, Thumbnails, SubscriberCount, VideoCount)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                ch.channel_id,
                ch.title,
                ch.thumbnails,
                ch.subscriber_count,
                ch.video_count
            ],
        )
        .map_err(|e| format!("Lỗi lưu Channel: {e}"))?;
        Ok(())
    }

    fn upsert_video_tx(tx: &rusqlite::Transaction<'_>, v: &Video) -> Result<(), String> {
        tx.execute(
            "INSERT OR REPLACE INTO Videos (VideoId, Title, PublishedAt, Thumbnails, ViewCount, Duration, ChannelId)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                v.video_id,
                v.title,
                v.published_at,
                v.thumbnails,
                v.view_count,
                v.duration,
                v.channel_id
            ],
        )
        .map_err(|e| format!("Lỗi lưu Video: {e}"))?;
        Ok(())
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

    /// Xóa toàn bộ một Playlist và các PlaylistItems liên quan
    pub fn delete_playlist(&self, playlist_id: &str) -> Result<(), String> {
        let mut conn = self.connect()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        tx.execute(
            "DELETE FROM PlaylistItems WHERE PlaylistId = ?1",
            params![playlist_id],
        )
        .map_err(|e| format!("Lỗi xóa PlaylistItems của playlist: {e}"))?;

        tx.execute(
            "DELETE FROM Playlists WHERE PlaylistId = ?1",
            params![playlist_id],
        )
        .map_err(|e| format!("Lỗi xóa Playlist: {e}"))?;

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sqlite_schema_and_crud() {
        let temp_path = std::env::temp_dir().join("test_playlist_youtube.db");
        let _ = std::fs::remove_file(&temp_path);

        let db = Database::new(&temp_path).expect("init db");
        assert!(!db.check_existing_playlist("PL123").unwrap());

        let ch = Channel {
            channel_id: "UC1".into(),
            title: Some("Test Channel".into()),
            thumbnails: None,
            subscriber_count: Some(1000),
            video_count: Some(10),
        };
        let pl = Playlist {
            playlist_id: "PL123".into(),
            title: Some("My Rust Playlist".into()),
            published_at: Some("2026-01-01T00:00:00Z".into()),
            thumbnails: None,
            channel_id: Some("UC1".into()),
            channel_title: Some("Test Channel".into()),
            item_count: 2,
        };
        let videos = vec![
            Video {
                video_id: "VID_ACTIVE".into(),
                title: Some("Learn Iced & Rust".into()),
                published_at: Some("2026-01-02T00:00:00Z".into()),
                thumbnails: None,
                view_count: Some(15_400),
                duration: Some("PT12M5S".into()),
                channel_id: Some("UC1".into()),
            },
            Video {
                video_id: "VID_HIDDEN".into(),
                title: None,
                published_at: None,
                thumbnails: None,
                view_count: None,
                duration: None,
                channel_id: None,
            },
        ];
        let items = vec![
            PlaylistItem {
                id: "ITEM1".into(),
                video_id: "VID_ACTIVE".into(),
                playlist_id: "PL123".into(),
                added_at: "2026-02-01T00:00:00Z".into(),
                index_video: 2,
            },
            PlaylistItem {
                id: "ITEM2".into(),
                video_id: "VID_HIDDEN".into(),
                playlist_id: "PL123".into(),
                added_at: "2026-01-15T00:00:00Z".into(),
                index_video: 1,
            },
        ];

        db.save_playlist_bundle(&pl, Some(&ch), std::slice::from_ref(&ch), &videos, &items, false)
            .expect("save bundle");

        assert!(db.check_existing_playlist("PL123").unwrap());
        let playlists = db.get_playlists().unwrap();
        assert_eq!(playlists.len(), 1);

        let (paged, total) = db
            .get_videos_paginated("PL123", 1, 50, SortColumn::IndexVideo, SortOrder::Desc)
            .unwrap();
        assert_eq!(total, 2);
        assert_eq!(paged.len(), 2);

        let hidden = db.get_hidden_videos("PL123").unwrap();
        assert_eq!(hidden.len(), 1);
        assert_eq!(hidden[0].video_id, "VID_HIDDEN");

        let (searched, search_total) = db.search_videos("PL123", "Iced", 1, 50).unwrap();
        assert_eq!(search_total, 1);
        assert_eq!(searched[0].video_id, "VID_ACTIVE");

        db.delete_video("VID_HIDDEN").unwrap();
        assert_eq!(db.get_hidden_videos("PL123").unwrap().len(), 0);

        let _ = std::fs::remove_file(&temp_path);
    }
}

