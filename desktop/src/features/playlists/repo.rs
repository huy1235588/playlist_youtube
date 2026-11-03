use crate::core::db::Database;
use crate::features::playlists::model::{Channel, Playlist};
use crate::features::videos::model::{PlaylistItem, Video};
use rusqlite::{OptionalExtension, params};

impl Database {
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
}
