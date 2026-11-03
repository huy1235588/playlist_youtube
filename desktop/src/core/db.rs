use crate::features::playlists::model::Channel;
use crate::features::videos::model::Video;
use rusqlite::{Connection, params};
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

    pub(crate) fn connect(&self) -> Result<Connection, String> {
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

    pub(crate) fn upsert_channel_tx(
        tx: &rusqlite::Transaction<'_>,
        ch: &Channel,
    ) -> Result<(), String> {
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

    pub(crate) fn upsert_video_tx(tx: &rusqlite::Transaction<'_>, v: &Video) -> Result<(), String> {
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::features::playlists::model::Playlist;
    use crate::features::videos::model::{PlaylistItem, SortColumn, SortOrder};

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
