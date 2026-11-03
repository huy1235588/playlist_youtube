package com.playlistyoutube.app.data.repository

import com.playlistyoutube.app.data.local.ApiKeyPreferences
import com.playlistyoutube.app.data.local.dao.PlaylistDao
import com.playlistyoutube.app.data.local.entities.ChannelEntity
import com.playlistyoutube.app.data.local.entities.PlaylistEntity
import com.playlistyoutube.app.data.local.entities.PlaylistItemEntity
import com.playlistyoutube.app.data.local.entities.PlaylistWithChannel
import com.playlistyoutube.app.data.local.entities.VideoEntity
import com.playlistyoutube.app.data.local.entities.VideoItemUiModel
import com.playlistyoutube.app.data.remote.YouTubeApiService
import com.playlistyoutube.app.util.FormatUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

data class ActionResult(
    val success: Boolean,
    val message: String
)

class PlaylistRepository(
    private val dao: PlaylistDao,
    private val apiService: YouTubeApiService,
    private val apiKeyPrefs: ApiKeyPreferences
) {

    val playlistsFlow: Flow<List<PlaylistWithChannel>> = dao.observePlaylistsWithChannel()

    private fun apiKey(): String = apiKeyPrefs.getApiKey()

    suspend fun getVideosPage(
        playlistId: String,
        column: String,
        order: String,
        pageNumber: Int,
        pageSize: Int = 50
    ): Pair<List<VideoItemUiModel>, Boolean> = withContext(Dispatchers.IO) {
        val offset = (pageNumber - 1).coerceAtLeast(0) * pageSize
        val videos = dao.getVideosSorted(
            playlistId = playlistId,
            column = column,
            order = order.uppercase(),
            limit = pageSize,
            offset = offset
        )
        val totalCount = dao.countVideosInPlaylist(playlistId)
        val isOverVideo = (offset + videos.size) >= totalCount
        videos to isOverVideo
    }

    suspend fun searchVideos(
        playlistId: String,
        query: String
    ): List<VideoItemUiModel> = withContext(Dispatchers.IO) {
        dao.searchVideosInPlaylist(playlistId, query.trim())
    }

    suspend fun getHiddenVideos(
        playlistId: String
    ): List<VideoItemUiModel> = withContext(Dispatchers.IO) {
        dao.getHiddenVideos(playlistId)
    }

    /**
     * Tải toàn bộ thông tin Playlist, Channel, PlaylistItems và Videos từ YouTube Data API v3
     * và lưu trực tiếp vào SQLite (Room) trên thiết bị (thay thế hoàn toàn /api/video/fetch).
     */
    suspend fun fetchAndSavePlaylist(
        inputUrlOrId: String,
        onProgress: (String) -> Unit = {}
    ): ActionResult = withContext(Dispatchers.IO) {
        try {
            val playlistId = FormatUtils.extractPlaylistId(inputUrlOrId)
                ?: return@withContext ActionResult(
                    success = false,
                    message = "URL hoặc ID danh sách phát không hợp lệ (Cần có ?list=...)"
                )

            if (dao.countPlaylistById(playlistId) > 0) {
                return@withContext ActionResult(
                    success = false,
                    message = "PlaylistId đã tồn tại trong thiết bị"
                )
            }

            val key = apiKey()
            onProgress("Đang lấy thông tin danh sách phát...")

            val playlistResponse = apiService.getPlaylists(id = playlistId, apiKey = key)
            val playlistDto = playlistResponse.items.firstOrNull()
                ?: return@withContext ActionResult(
                    success = false,
                    message = "Không tìm thấy danh sách phát trên YouTube (Kiểm tra quyền công khai hoặc API Key)"
                )

            val ownerChannelId = playlistDto.snippet?.channelId.orEmpty()
            val playlistEntity = PlaylistEntity(
                playlistId = playlistId,
                title = playlistDto.snippet?.title ?: "Untitled Playlist",
                publishedAt = playlistDto.snippet?.publishedAt,
                thumbnails = playlistDto.snippet?.thumbnails?.bestUrl(),
                channelId = ownerChannelId,
                channelTitle = playlistDto.snippet?.channelTitle.orEmpty(),
                itemCount = playlistDto.contentDetails?.itemCount ?: 0
            )

            // Tải toàn bộ các mục trong Playlist (phân trang qua nextPageToken)
            val rawItems = mutableListOf<RawPlaylistItem>()
            var nextPageToken: String? = null
            var pageCount = 0

            do {
                pageCount++
                onProgress("Đang tải danh sách video (Trang $pageCount)...")
                val itemsResponse = apiService.getPlaylistItems(
                    playlistId = playlistId,
                    pageToken = nextPageToken,
                    apiKey = key
                )
                for (item in itemsResponse.items) {
                    val videoId = item.contentDetails?.videoId ?: continue
                    rawItems.add(
                        RawPlaylistItem(
                            id = item.id,
                            videoId = videoId,
                            addedAt = item.snippet?.publishedAt.orEmpty(),
                            channelId = item.snippet?.videoOwnerChannelId
                        )
                    )
                }
                nextPageToken = itemsResponse.nextPageToken
            } while (!nextPageToken.isNullOrEmpty())

            // Gán indexVideo giảm dần từ tổng số video về 1 (giống hệt logic backend)
            val totalItems = rawItems.size
            val playlistItemEntities = rawItems.mapIndexed { idx, raw ->
                PlaylistItemEntity(
                    id = raw.id,
                    videoId = raw.videoId,
                    playlistId = playlistId,
                    addedAt = raw.addedAt,
                    indexVideo = totalItems - idx
                )
            }

            // Tải thông tin Channels theo lô 50 ID/lượt
            val allChannelIds = buildSet {
                if (ownerChannelId.isNotBlank()) add(ownerChannelId)
                rawItems.mapNotNull { it.channelId }.filter { it.isNotBlank() }.forEach { add(it) }
            }.toList()

            onProgress("Đang tải thông tin ${allChannelIds.size} kênh...")
            fetchAndSaveChannelsBatch(allChannelIds, key)

            // Tải thông tin Videos theo lô 50 ID/lượt (phát hiện cả video bị ẩn/xóa)
            val allVideoIds = rawItems.map { it.videoId }.distinct()
            onProgress("Đang tải chi tiết ${allVideoIds.size} video...")
            fetchAndSaveVideosBatch(allVideoIds, key)

            // Lưu Playlist và PlaylistItems vào Room DB
            dao.insertPlaylist(playlistEntity.copy(itemCount = totalItems))
            dao.insertPlaylistItems(playlistItemEntities)

            ActionResult(
                success = true,
                message = "Đã thêm thành công danh sách phát (${totalItems} video)"
            )
        } catch (e: Exception) {
            ActionResult(
                success = false,
                message = "Lỗi khi tải danh sách phát: ${e.localizedMessage ?: e.message}"
            )
        }
    }

    /**
     * Cập nhật Playlist: lấy các video mới được thêm vào playlist trên YouTube
     * kể từ video mới nhất hiện có trong DB (thay thế hoàn toàn /api/video/update).
     */
    suspend fun updatePlaylist(
        playlistId: String,
        onProgress: (String) -> Unit = {}
    ): ActionResult = withContext(Dispatchers.IO) {
        try {
            val key = apiKey()
            onProgress("Đang kiểm tra cập nhật danh sách phát...")

            val playlistResponse = apiService.getPlaylists(id = playlistId, apiKey = key)
            val playlistDto = playlistResponse.items.firstOrNull()
                ?: return@withContext ActionResult(
                    success = false,
                    message = "Không tìm thấy danh sách phát trên YouTube"
                )

            val existingVideoIds = dao.getAllVideoIdsInPlaylist(playlistId).toSet()
            val latestVideoId = dao.getLatestVideoIdInPlaylist(playlistId)

            val newRawItems = mutableListOf<RawPlaylistItem>()
            var nextPageToken: String? = null
            var reachedExisting = false

            do {
                val response = apiService.getPlaylistItems(
                    playlistId = playlistId,
                    pageToken = nextPageToken,
                    apiKey = key
                )
                for (item in response.items) {
                    val videoId = item.contentDetails?.videoId ?: continue
                    if (videoId == latestVideoId || existingVideoIds.contains(videoId)) {
                        reachedExisting = true
                        break
                    }
                    newRawItems.add(
                        RawPlaylistItem(
                            id = item.id,
                            videoId = videoId,
                            addedAt = item.snippet?.publishedAt.orEmpty(),
                            channelId = item.snippet?.videoOwnerChannelId
                        )
                    )
                }
                if (reachedExisting) break
                nextPageToken = response.nextPageToken
            } while (!nextPageToken.isNullOrEmpty())

            if (newRawItems.isNotEmpty()) {
                val channelIds = newRawItems.mapNotNull { it.channelId }.filter { it.isNotBlank() }.distinct()
                onProgress("Đang tải ${newRawItems.size} video mới...")
                fetchAndSaveChannelsBatch(channelIds, key)
                fetchAndSaveVideosBatch(newRawItems.map { it.videoId }.distinct(), key)

                val currentMaxIndex = dao.getMaxIndexInPlaylist(playlistId) ?: 0
                val countNew = newRawItems.size
                val itemEntities = newRawItems.mapIndexed { idx, raw ->
                    PlaylistItemEntity(
                        id = raw.id,
                        videoId = raw.videoId,
                        playlistId = playlistId,
                        addedAt = raw.addedAt,
                        indexVideo = currentMaxIndex + (countNew - idx)
                    )
                }
                dao.insertPlaylistItems(itemEntities)
            }

            val totalNow = dao.countVideosInPlaylist(playlistId)
            dao.updatePlaylistMeta(
                playlistId = playlistId,
                title = playlistDto.snippet?.title ?: "Playlist",
                thumbnails = playlistDto.snippet?.thumbnails?.bestUrl(),
                itemCount = totalNow
            )

            ActionResult(
                success = true,
                message = "Đã cập nhật thêm ${newRawItems.size} video mới vào danh sách phát"
            )
        } catch (e: Exception) {
            ActionResult(
                success = false,
                message = "Lỗi cập nhật danh sách phát: ${e.localizedMessage ?: e.message}"
            )
        }
    }

    /**
     * Thay thế một video (ví dụ video bị ẩn/xóa) trong danh sách phát bằng URL hoặc ID video mới.
     */
    suspend fun replaceVideo(
        playlistItemId: String,
        newVideoInput: String
    ): ActionResult = withContext(Dispatchers.IO) {
        try {
            val newVideoId = FormatUtils.extractVideoId(newVideoInput)
                ?: return@withContext ActionResult(
                    success = false,
                    message = "URL hoặc ID video YouTube không hợp lệ"
                )

            val key = apiKey()
            val videoResponse = apiService.getVideos(idsCommaSeparated = newVideoId, apiKey = key)
            val videoDto = videoResponse.items.firstOrNull()
                ?: return@withContext ActionResult(
                    success = false,
                    message = "Không tìm thấy video mới trên YouTube"
                )

            val channelId = videoDto.snippet?.channelId
            if (!channelId.isNullOrBlank()) {
                fetchAndSaveChannelsBatch(listOf(channelId), key)
            }

            val durationIso = videoDto.contentDetails?.duration
            val videoEntity = VideoEntity(
                videoId = newVideoId,
                title = videoDto.snippet?.title,
                publishedAt = videoDto.snippet?.publishedAt,
                thumbnails = videoDto.snippet?.thumbnails?.bestUrl(),
                viewCount = videoDto.statistics?.viewCount?.toLongOrNull() ?: 0L,
                duration = durationIso,
                durationSeconds = FormatUtils.parseIsoDurationSeconds(durationIso),
                channelId = channelId
            )

            dao.insertVideo(videoEntity)
            dao.updatePlaylistItemVideoId(playlistItemId = playlistItemId, newVideoId = newVideoId)

            ActionResult(
                success = true,
                message = "Đã thay thế bằng video: ${videoEntity.title}"
            )
        } catch (e: Exception) {
            ActionResult(
                success = false,
                message = "Lỗi khi thay thế video: ${e.localizedMessage ?: e.message}"
            )
        }
    }

    /**
     * Xóa video khỏi danh sách phát và cơ sở dữ liệu thiết bị.
     */
    suspend fun deleteVideo(videoId: String): ActionResult = withContext(Dispatchers.IO) {
        try {
            dao.deleteVideoComplete(videoId)
            ActionResult(
                success = true,
                message = "Đã xóa video khỏi danh sách phát"
            )
        } catch (e: Exception) {
            ActionResult(
                success = false,
                message = "Lỗi khi xóa video: ${e.localizedMessage ?: e.message}"
            )
        }
    }

    /**
     * Xóa toàn bộ một Playlist khỏi thiết bị.
     */
    suspend fun deletePlaylist(playlistId: String): ActionResult = withContext(Dispatchers.IO) {
        try {
            dao.deletePlaylistComplete(playlistId)
            ActionResult(
                success = true,
                message = "Đã xóa danh sách phát"
            )
        } catch (e: Exception) {
            ActionResult(
                success = false,
                message = "Lỗi khi xóa danh sách phát: ${e.localizedMessage ?: e.message}"
            )
        }
    }

    /**
     * Đặt ảnh thu nhỏ của một video làm ảnh đại diện cho Playlist.
     */
    suspend fun setPlaylistThumbnail(
        playlistId: String,
        thumbnailUrl: String?
    ): ActionResult = withContext(Dispatchers.IO) {
        if (thumbnailUrl.isNullOrBlank()) {
            return@withContext ActionResult(false, "Video này không có hình thu nhỏ hợp lệ")
        }
        dao.updatePlaylistThumbnail(playlistId, thumbnailUrl)
        ActionResult(true, "Đã đặt làm hình nền của danh sách phát")
    }

    private suspend fun fetchAndSaveChannelsBatch(channelIds: List<String>, apiKey: String) {
        if (channelIds.isEmpty()) return
        val existing = dao.getExistingChannelIds(channelIds).toSet()
        val missingIds = channelIds.filterNot { existing.contains(it) }
        for (chunk in missingIds.chunked(50)) {
            val response = apiService.getChannels(
                idsCommaSeparated = chunk.joinToString(","),
                apiKey = apiKey
            )
            val entities = response.items.map { dto ->
                ChannelEntity(
                    channelId = dto.id,
                    title = dto.snippet?.title.orEmpty(),
                    thumbnails = dto.snippet?.thumbnails?.bestUrl(),
                    subscriberCount = dto.statistics?.subscriberCount?.toLongOrNull(),
                    videoCount = dto.statistics?.videoCount?.toLongOrNull()
                )
            }
            if (entities.isNotEmpty()) {
                dao.insertChannels(entities)
            }
        }
    }

    private suspend fun fetchAndSaveVideosBatch(videoIds: List<String>, apiKey: String) {
        if (videoIds.isEmpty()) return
        for (chunk in videoIds.chunked(50)) {
            val response = apiService.getVideos(
                idsCommaSeparated = chunk.joinToString(","),
                apiKey = apiKey
            )
            val foundMap = response.items.associateBy { it.id }

            // Nếu video không trả về trong kết quả API -> video đã bị xóa hoặc ẩn trên YouTube
            // Lưu với title = null, duration = null giống hệt logic youtubeService.js ở bản Web
            val entities = chunk.map { id ->
                val dto = foundMap[id]
                if (dto != null) {
                    val durationIso = dto.contentDetails?.duration
                    VideoEntity(
                        videoId = id,
                        title = dto.snippet?.title,
                        publishedAt = dto.snippet?.publishedAt,
                        thumbnails = dto.snippet?.thumbnails?.bestUrl(),
                        viewCount = dto.statistics?.viewCount?.toLongOrNull() ?: 0L,
                        duration = durationIso,
                        durationSeconds = FormatUtils.parseIsoDurationSeconds(durationIso),
                        channelId = dto.snippet?.channelId
                    )
                } else {
                    VideoEntity(
                        videoId = id,
                        title = null,
                        publishedAt = null,
                        thumbnails = null,
                        viewCount = null,
                        duration = null,
                        durationSeconds = 0L,
                        channelId = null
                    )
                }
            }
            dao.insertVideos(entities)
        }
    }

    private data class RawPlaylistItem(
        val id: String,
        val videoId: String,
        val addedAt: String,
        val channelId: String?
    )
}
