package com.playlistyoutube.app.data.remote

import com.google.gson.annotations.SerializedName

data class YouTubeListResponse<T>(
    @SerializedName("nextPageToken") val nextPageToken: String? = null,
    @SerializedName("pageInfo") val pageInfo: PageInfoDto? = null,
    @SerializedName("items") val items: List<T> = emptyList()
)

data class PageInfoDto(
    @SerializedName("totalResults") val totalResults: Int = 0,
    @SerializedName("resultsPerPage") val resultsPerPage: Int = 0
)

// ==================== PLAYLIST DTO ====================

data class PlaylistDto(
    @SerializedName("id") val id: String,
    @SerializedName("snippet") val snippet: PlaylistSnippetDto?,
    @SerializedName("contentDetails") val contentDetails: PlaylistContentDetailsDto?
)

data class PlaylistSnippetDto(
    @SerializedName("publishedAt") val publishedAt: String?,
    @SerializedName("channelId") val channelId: String?,
    @SerializedName("title") val title: String?,
    @SerializedName("channelTitle") val channelTitle: String?,
    @SerializedName("thumbnails") val thumbnails: ThumbnailsDto?
)

data class PlaylistContentDetailsDto(
    @SerializedName("itemCount") val itemCount: Int?
)

// ==================== PLAYLIST ITEM DTO ====================

data class PlaylistItemDto(
    @SerializedName("id") val id: String,
    @SerializedName("snippet") val snippet: PlaylistItemSnippetDto?,
    @SerializedName("contentDetails") val contentDetails: PlaylistItemContentDetailsDto?
)

data class PlaylistItemSnippetDto(
    @SerializedName("publishedAt") val publishedAt: String?,
    @SerializedName("title") val title: String?,
    @SerializedName("videoOwnerChannelId") val videoOwnerChannelId: String?
)

data class PlaylistItemContentDetailsDto(
    @SerializedName("videoId") val videoId: String?,
    @SerializedName("videoPublishedAt") val videoPublishedAt: String?
)

// ==================== VIDEO DTO ====================

data class VideoDto(
    @SerializedName("id") val id: String,
    @SerializedName("snippet") val snippet: VideoSnippetDto?,
    @SerializedName("contentDetails") val contentDetails: VideoContentDetailsDto?,
    @SerializedName("statistics") val statistics: VideoStatisticsDto?
)

data class VideoSnippetDto(
    @SerializedName("publishedAt") val publishedAt: String?,
    @SerializedName("channelId") val channelId: String?,
    @SerializedName("title") val title: String?,
    @SerializedName("channelTitle") val channelTitle: String?,
    @SerializedName("thumbnails") val thumbnails: ThumbnailsDto?
)

data class VideoContentDetailsDto(
    @SerializedName("duration") val duration: String?
)

data class VideoStatisticsDto(
    @SerializedName("viewCount") val viewCount: String?
)

// ==================== CHANNEL DTO ====================

data class ChannelDto(
    @SerializedName("id") val id: String,
    @SerializedName("snippet") val snippet: ChannelSnippetDto?,
    @SerializedName("statistics") val statistics: ChannelStatisticsDto?
)

data class ChannelSnippetDto(
    @SerializedName("title") val title: String?,
    @SerializedName("thumbnails") val thumbnails: ThumbnailsDto?
)

data class ChannelStatisticsDto(
    @SerializedName("subscriberCount") val subscriberCount: String?,
    @SerializedName("videoCount") val videoCount: String?
)

// ==================== THUMBNAILS DTO ====================

data class ThumbnailsDto(
    @SerializedName("default") val default: ThumbnailItemDto?,
    @SerializedName("medium") val medium: ThumbnailItemDto?,
    @SerializedName("high") val high: ThumbnailItemDto?,
    @SerializedName("standard") val standard: ThumbnailItemDto?,
    @SerializedName("maxres") val maxres: ThumbnailItemDto?
) {
    fun bestUrl(): String? {
        return high?.url ?: medium?.url ?: standard?.url ?: maxres?.url ?: default?.url
    }
}

data class ThumbnailItemDto(
    @SerializedName("url") val url: String?
)
