package com.playlistyoutube.app.data.local.entities

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "playlists")
data class PlaylistEntity(
    @PrimaryKey
    @ColumnInfo(name = "playlist_id")
    val playlistId: String,
    @ColumnInfo(name = "title")
    val title: String,
    @ColumnInfo(name = "published_at")
    val publishedAt: String?,
    @ColumnInfo(name = "thumbnails")
    val thumbnails: String?,
    @ColumnInfo(name = "channel_id")
    val channelId: String,
    @ColumnInfo(name = "channel_title")
    val channelTitle: String,
    @ColumnInfo(name = "item_count")
    val itemCount: Int
)

@Entity(tableName = "channels")
data class ChannelEntity(
    @PrimaryKey
    @ColumnInfo(name = "channel_id")
    val channelId: String,
    @ColumnInfo(name = "title")
    val title: String,
    @ColumnInfo(name = "thumbnails")
    val thumbnails: String?,
    @ColumnInfo(name = "subscriber_count")
    val subscriberCount: Long?,
    @ColumnInfo(name = "video_count")
    val videoCount: Long?
)

@Entity(tableName = "videos")
data class VideoEntity(
    @PrimaryKey
    @ColumnInfo(name = "video_id")
    val videoId: String,
    @ColumnInfo(name = "title")
    val title: String?, // Null nếu video bị ẩn / xóa trên YouTube
    @ColumnInfo(name = "published_at")
    val publishedAt: String?,
    @ColumnInfo(name = "thumbnails")
    val thumbnails: String?,
    @ColumnInfo(name = "view_count")
    val viewCount: Long?,
    @ColumnInfo(name = "duration")
    val duration: String?,
    @ColumnInfo(name = "duration_seconds")
    val durationSeconds: Long = 0L,
    @ColumnInfo(name = "channel_id")
    val channelId: String?
)

@Entity(
    tableName = "playlist_items",
    indices = [
        Index(value = ["playlist_id"]),
        Index(value = ["video_id"])
    ]
)
data class PlaylistItemEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String,
    @ColumnInfo(name = "video_id")
    val videoId: String,
    @ColumnInfo(name = "playlist_id")
    val playlistId: String,
    @ColumnInfo(name = "added_at")
    val addedAt: String,
    @ColumnInfo(name = "index_video")
    val indexVideo: Int
)

/**
 * Model hiển thị Playlist kèm thông tin Channel (giống PlaylistYoutube.vue)
 */
data class PlaylistWithChannel(
    @ColumnInfo(name = "playlist_id") val playlistId: String,
    @ColumnInfo(name = "title") val title: String,
    @ColumnInfo(name = "published_at") val publishedAt: String?,
    @ColumnInfo(name = "thumbnails") val thumbnails: String?,
    @ColumnInfo(name = "channel_id") val channelId: String,
    @ColumnInfo(name = "channel_title") val channelTitle: String,
    @ColumnInfo(name = "item_count") val itemCount: Int,
    @ColumnInfo(name = "channel_avatar") val channelAvatar: String?
)

/**
 * Model hiển thị Video trong Playlist (giống dữ liệu trả về cho VideoYoutube.vue & HiddenVideo.vue)
 */
data class VideoItemUiModel(
    @ColumnInfo(name = "playlist_item_id") val playlistItemId: String,
    @ColumnInfo(name = "video_id") val videoId: String,
    @ColumnInfo(name = "video_title") val videoTitle: String?,
    @ColumnInfo(name = "channel_id") val channelId: String?,
    @ColumnInfo(name = "channel_title") val channelTitle: String?,
    @ColumnInfo(name = "view_count") val viewCount: Long?,
    @ColumnInfo(name = "published_at") val publishedAt: String?,
    @ColumnInfo(name = "thumbnails") val thumbnails: String?,
    @ColumnInfo(name = "duration") val duration: String?,
    @ColumnInfo(name = "duration_seconds") val durationSeconds: Long,
    @ColumnInfo(name = "added_at") val addedAt: String,
    @ColumnInfo(name = "index_video") val indexVideo: Int
) {
    val isHiddenOrDeleted: Boolean
        get() = duration == null || videoTitle == null
}
