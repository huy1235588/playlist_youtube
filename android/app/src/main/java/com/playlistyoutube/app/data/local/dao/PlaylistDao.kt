package com.playlistyoutube.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.playlistyoutube.app.data.local.entities.ChannelEntity
import com.playlistyoutube.app.data.local.entities.PlaylistEntity
import com.playlistyoutube.app.data.local.entities.PlaylistItemEntity
import com.playlistyoutube.app.data.local.entities.PlaylistWithChannel
import com.playlistyoutube.app.data.local.entities.VideoEntity
import com.playlistyoutube.app.data.local.entities.VideoItemUiModel
import kotlinx.coroutines.flow.Flow

@Dao
interface PlaylistDao {

    // ==================== PLAYLISTS ====================

    @Query(
        """
        SELECT 
            p.playlist_id,
            p.title,
            p.published_at,
            p.thumbnails,
            p.channel_id,
            p.channel_title,
            (SELECT COUNT(*) FROM playlist_items pi WHERE pi.playlist_id = p.playlist_id) AS item_count,
            c.thumbnails AS channel_avatar
        FROM playlists p
        LEFT JOIN channels c ON p.channel_id = c.channel_id
        ORDER BY p.published_at DESC
        """
    )
    fun observePlaylistsWithChannel(): Flow<List<PlaylistWithChannel>>

    @Query("SELECT COUNT(*) FROM playlists WHERE playlist_id = :playlistId")
    suspend fun countPlaylistById(playlistId: String): Int

    @Query("SELECT * FROM playlists WHERE playlist_id = :playlistId LIMIT 1")
    suspend fun getPlaylistById(playlistId: String): PlaylistEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylist(playlist: PlaylistEntity)

    @Query("UPDATE playlists SET item_count = :itemCount, title = :title, thumbnails = :thumbnails WHERE playlist_id = :playlistId")
    suspend fun updatePlaylistMeta(playlistId: String, title: String, thumbnails: String?, itemCount: Int)

    @Query("UPDATE playlists SET thumbnails = :thumbnailUrl WHERE playlist_id = :playlistId")
    suspend fun updatePlaylistThumbnail(playlistId: String, thumbnailUrl: String)

    @Query("DELETE FROM playlists WHERE playlist_id = :playlistId")
    suspend fun deletePlaylistById(playlistId: String)

    @Query("DELETE FROM playlist_items WHERE playlist_id = :playlistId")
    suspend fun deletePlaylistItemsByPlaylistId(playlistId: String)

    @Transaction
    suspend fun deletePlaylistComplete(playlistId: String) {
        deletePlaylistItemsByPlaylistId(playlistId)
        deletePlaylistById(playlistId)
    }

    // ==================== CHANNELS ====================

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChannels(channels: List<ChannelEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChannel(channel: ChannelEntity)

    @Query("SELECT channel_id FROM channels WHERE channel_id IN (:channelIds)")
    suspend fun getExistingChannelIds(channelIds: List<String>): List<String>

    // ==================== VIDEOS & PLAYLIST ITEMS ====================

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVideos(videos: List<VideoEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVideo(video: VideoEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylistItems(items: List<PlaylistItemEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylistItem(item: PlaylistItemEntity)

    @Query("SELECT video_id FROM playlist_items WHERE playlist_id = :playlistId")
    suspend fun getAllVideoIdsInPlaylist(playlistId: String): List<String>

    @Query("SELECT MAX(index_video) FROM playlist_items WHERE playlist_id = :playlistId")
    suspend fun getMaxIndexInPlaylist(playlistId: String): Int?

    @Query("SELECT video_id FROM playlist_items WHERE playlist_id = :playlistId ORDER BY index_video DESC LIMIT 1")
    suspend fun getLatestVideoIdInPlaylist(playlistId: String): String?

    @Query("SELECT COUNT(*) FROM playlist_items WHERE playlist_id = :playlistId")
    suspend fun countVideosInPlaylist(playlistId: String): Int

    /**
     * Truy vấn danh sách video theo cột sắp xếp và thứ tự (ASC / DESC) có phân trang
     */
    @Query(
        """
        SELECT 
            pi.id AS playlist_item_id,
            pi.video_id AS video_id,
            v.title AS video_title,
            v.channel_id AS channel_id,
            c.title AS channel_title,
            v.view_count AS view_count,
            v.published_at AS published_at,
            v.thumbnails AS thumbnails,
            v.duration AS duration,
            COALESCE(v.duration_seconds, 0) AS duration_seconds,
            pi.added_at AS added_at,
            pi.index_video AS index_video
        FROM playlist_items pi
        LEFT JOIN videos v ON pi.video_id = v.video_id
        LEFT JOIN channels c ON v.channel_id = c.channel_id
        WHERE pi.playlist_id = :playlistId
        ORDER BY
            CASE WHEN :column = 'AddedAt' AND :order = 'ASC' THEN pi.index_video END ASC,
            CASE WHEN :column = 'AddedAt' AND :order = 'DESC' THEN pi.index_video END DESC,
            CASE WHEN :column = 'PublishedAt' AND :order = 'ASC' THEN COALESCE(v.published_at, '') END ASC,
            CASE WHEN :column = 'PublishedAt' AND :order = 'DESC' THEN COALESCE(v.published_at, '') END DESC,
            CASE WHEN :column = 'ViewCount' AND :order = 'ASC' THEN COALESCE(v.view_count, -1) END ASC,
            CASE WHEN :column = 'ViewCount' AND :order = 'DESC' THEN COALESCE(v.view_count, -1) END DESC,
            CASE WHEN :column = 'Duration' AND :order = 'ASC' THEN COALESCE(v.duration_seconds, -1) END ASC,
            CASE WHEN :column = 'Duration' AND :order = 'DESC' THEN COALESCE(v.duration_seconds, -1) END DESC,
            pi.index_video DESC
        LIMIT :limit OFFSET :offset
        """
    )
    suspend fun getVideosSorted(
        playlistId: String,
        column: String,
        order: String,
        limit: Int,
        offset: Int
    ): List<VideoItemUiModel>

    /**
     * Tìm kiếm video theo tiêu đề hoặc VideoId trong playlist
     */
    @Query(
        """
        SELECT 
            pi.id AS playlist_item_id,
            pi.video_id AS video_id,
            v.title AS video_title,
            v.channel_id AS channel_id,
            c.title AS channel_title,
            v.view_count AS view_count,
            v.published_at AS published_at,
            v.thumbnails AS thumbnails,
            v.duration AS duration,
            COALESCE(v.duration_seconds, 0) AS duration_seconds,
            pi.added_at AS added_at,
            pi.index_video AS index_video
        FROM playlist_items pi
        LEFT JOIN videos v ON pi.video_id = v.video_id
        LEFT JOIN channels c ON v.channel_id = c.channel_id
        WHERE pi.playlist_id = :playlistId
          AND (v.title LIKE '%' || :query || '%' OR pi.video_id LIKE '%' || :query || '%' OR c.title LIKE '%' || :query || '%')
        ORDER BY pi.index_video DESC
        """
    )
    suspend fun searchVideosInPlaylist(
        playlistId: String,
        query: String
    ): List<VideoItemUiModel>

    /**
     * Lấy danh sách các video bị ẩn / đã bị xóa trên YouTube (title IS NULL hoặc duration IS NULL)
     */
    @Query(
        """
        SELECT 
            pi.id AS playlist_item_id,
            pi.video_id AS video_id,
            v.title AS video_title,
            v.channel_id AS channel_id,
            c.title AS channel_title,
            v.view_count AS view_count,
            v.published_at AS published_at,
            v.thumbnails AS thumbnails,
            v.duration AS duration,
            COALESCE(v.duration_seconds, 0) AS duration_seconds,
            pi.added_at AS added_at,
            pi.index_video AS index_video
        FROM playlist_items pi
        LEFT JOIN videos v ON pi.video_id = v.video_id
        LEFT JOIN channels c ON v.channel_id = c.channel_id
        WHERE pi.playlist_id = :playlistId
          AND (v.title IS NULL OR v.duration IS NULL)
        ORDER BY pi.index_video DESC
        """
    )
    suspend fun getHiddenVideos(playlistId: String): List<VideoItemUiModel>

    /**
     * Xóa video khỏi PlaylistItems và Videos (giống DeleteModel.deleteByVideoId)
     */
    @Query("DELETE FROM playlist_items WHERE video_id = :videoId")
    suspend fun deletePlaylistItemsByVideoId(videoId: String)

    @Query("DELETE FROM videos WHERE video_id = :videoId")
    suspend fun deleteVideoById(videoId: String)

    @Transaction
    suspend fun deleteVideoComplete(videoId: String) {
        deletePlaylistItemsByVideoId(videoId)
        deleteVideoById(videoId)
    }

    /**
     * Thay thế một video bị lỗi/ẩn trong PlaylistItems bằng một video mới
     */
    @Query("UPDATE playlist_items SET video_id = :newVideoId WHERE id = :playlistItemId")
    suspend fun updatePlaylistItemVideoId(playlistItemId: String, newVideoId: String)
}
