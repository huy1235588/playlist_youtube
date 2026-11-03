package com.playlistyoutube.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.playlistyoutube.app.data.local.ApiKeyPreferences
import com.playlistyoutube.app.data.local.AppDatabase
import com.playlistyoutube.app.data.local.entities.PlaylistWithChannel
import com.playlistyoutube.app.data.local.entities.VideoItemUiModel
import com.playlistyoutube.app.data.remote.YouTubeApiService
import com.playlistyoutube.app.data.repository.ActionResult
import com.playlistyoutube.app.data.repository.PlaylistRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class SortColumn(
    val columnKey: String,
    val label: String,
    val ascText: String,
    val descText: String
) {
    ADDED_AT("AddedAt", "Ngày thêm (Date added)", "Cũ nhất (oldest)", "Mới nhất (latest)"),
    PUBLISHED_AT("PublishedAt", "Ngày phát hành (Publication date)", "Cũ nhất (oldest)", "Mới nhất (latest)"),
    VIEW_COUNT("ViewCount", "Lượt xem (View count)", "Tăng dần (ascending)", "Giảm dần (decrease)"),
    DURATION("Duration", "Thời lượng (Video duration)", "Ngắn nhất (at least)", "Dài nhất (at most)")
}

enum class SortOrder(val sqlValue: String) {
    ASC("ASC"),
    DESC("DESC");

    fun toggle(): SortOrder = if (this == ASC) DESC else ASC
}

data class MainUiState(
    val playlists: List<PlaylistWithChannel> = emptyList(),
    val selectedPlaylist: PlaylistWithChannel? = null,
    val videos: List<VideoItemUiModel> = emptyList(),
    val hiddenVideos: List<VideoItemUiModel> = emptyList(),
    val isShowHiddenVideos: Boolean = false,
    val searchQuery: String = "",
    val sortColumn: SortColumn = SortColumn.ADDED_AT,
    val sortOrder: SortOrder = SortOrder.DESC,
    val currentPage: Int = 1,
    val isOverVideo: Boolean = false,
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val progressMessage: String = "",
    val snackbarMessage: String? = null,
    val playingVideo: VideoItemUiModel? = null
)

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val database = AppDatabase.getInstance(application)
    private val apiKeyPrefs = ApiKeyPreferences(application)
    private val apiService = YouTubeApiService.create()
    private val repository = PlaylistRepository(
        dao = database.playlistDao(),
        apiService = apiService,
        apiKeyPrefs = apiKeyPrefs
    )

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    init {
        viewModelScope.launch {
            repository.playlistsFlow.collectLatest { playlists ->
                _uiState.update { current ->
                    val updatedSelected = current.selectedPlaylist?.let { sel ->
                        playlists.find { it.playlistId == sel.playlistId }
                    }
                    current.copy(
                        playlists = playlists,
                        selectedPlaylist = updatedSelected
                    )
                }
            }
        }
    }

    fun selectPlaylist(playlist: PlaylistWithChannel) {
        _uiState.update {
            it.copy(
                selectedPlaylist = playlist,
                isShowHiddenVideos = false,
                searchQuery = "",
                currentPage = 1,
                isOverVideo = false
            )
        }
        loadFirstPage()
    }

    fun backToPlaylistSelection() {
        _uiState.update {
            it.copy(
                selectedPlaylist = null,
                isShowHiddenVideos = false,
                searchQuery = "",
                videos = emptyList(),
                hiddenVideos = emptyList()
            )
        }
    }

    fun loadFirstPage() {
        val playlistId = _uiState.value.selectedPlaylist?.playlistId ?: return
        val state = _uiState.value
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, currentPage = 1) }
            val (videos, isOver) = repository.getVideosPage(
                playlistId = playlistId,
                column = state.sortColumn.columnKey,
                order = state.sortOrder.sqlValue,
                pageNumber = 1
            )
            val hidden = repository.getHiddenVideos(playlistId)
            _uiState.update {
                it.copy(
                    videos = videos,
                    hiddenVideos = hidden,
                    currentPage = 1,
                    isOverVideo = isOver,
                    isLoading = false
                )
            }
        }
    }

    fun loadNextPage() {
        val state = _uiState.value
        val playlistId = state.selectedPlaylist?.playlistId ?: return
        if (state.isLoading || state.isLoadingMore || state.isOverVideo || state.isShowHiddenVideos || state.searchQuery.isNotBlank()) {
            return
        }

        viewModelScope.launch {
            val nextPage = state.currentPage + 1
            _uiState.update { it.copy(isLoadingMore = true) }
            val (moreVideos, isOver) = repository.getVideosPage(
                playlistId = playlistId,
                column = state.sortColumn.columnKey,
                order = state.sortOrder.sqlValue,
                pageNumber = nextPage
            )
            _uiState.update {
                it.copy(
                    videos = it.videos + moreVideos,
                    currentPage = nextPage,
                    isOverVideo = isOver,
                    isLoadingMore = false
                )
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.update { it.copy(searchQuery = query, isShowHiddenVideos = false) }
        val playlistId = _uiState.value.selectedPlaylist?.playlistId ?: return

        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(250)
            if (query.isBlank()) {
                loadFirstPage()
            } else {
                val results = repository.searchVideos(playlistId, query)
                _uiState.update {
                    it.copy(
                        videos = results,
                        isOverVideo = true
                    )
                }
            }
        }
    }

    fun onSortSelected(column: SortColumn, order: SortOrder) {
        _uiState.update {
            it.copy(
                sortColumn = column,
                sortOrder = order,
                isShowHiddenVideos = false
            )
        }
        loadFirstPage()
    }

    fun toggleShowHiddenVideos() {
        val playlistId = _uiState.value.selectedPlaylist?.playlistId ?: return
        val nextShowHidden = !_uiState.value.isShowHiddenVideos
        viewModelScope.launch {
            val hidden = repository.getHiddenVideos(playlistId)
            _uiState.update {
                it.copy(
                    isShowHiddenVideos = nextShowHidden,
                    hiddenVideos = hidden
                )
            }
        }
    }

    fun addPlaylist(
        inputUrlOrId: String,
        onComplete: (ActionResult) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, progressMessage = "Đang chuẩn bị...") }
            val result = repository.fetchAndSavePlaylist(inputUrlOrId) { progress ->
                _uiState.update { it.copy(progressMessage = progress) }
            }
            _uiState.update {
                it.copy(
                    isLoading = false,
                    progressMessage = "",
                    snackbarMessage = result.message
                )
            }
            onComplete(result)
        }
    }

    fun updatePlaylist(
        playlistId: String,
        onComplete: (ActionResult) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, progressMessage = "Đang đồng bộ từ YouTube...") }
            val result = repository.updatePlaylist(playlistId) { progress ->
                _uiState.update { it.copy(progressMessage = progress) }
            }
            _uiState.update {
                it.copy(
                    isLoading = false,
                    progressMessage = "",
                    snackbarMessage = result.message
                )
            }
            if (_uiState.value.selectedPlaylist?.playlistId == playlistId) {
                loadFirstPage()
            }
            onComplete(result)
        }
    }

    fun replaceVideo(
        playlistItemId: String,
        newVideoInput: String,
        onComplete: (ActionResult) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, progressMessage = "Đang thay thế video...") }
            val result = repository.replaceVideo(playlistItemId, newVideoInput)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    progressMessage = "",
                    snackbarMessage = result.message
                )
            }
            if (result.success) {
                loadFirstPage()
            }
            onComplete(result)
        }
    }

    fun deleteVideo(
        videoId: String,
        onComplete: (ActionResult) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val result = repository.deleteVideo(videoId)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    snackbarMessage = result.message
                )
            }
            if (result.success) {
                loadFirstPage()
            }
            onComplete(result)
        }
    }

    fun deletePlaylist(
        playlistId: String,
        onComplete: (ActionResult) -> Unit
    ) {
        viewModelScope.launch {
            val result = repository.deletePlaylist(playlistId)
            if (_uiState.value.selectedPlaylist?.playlistId == playlistId) {
                backToPlaylistSelection()
            }
            _uiState.update { it.copy(snackbarMessage = result.message) }
            onComplete(result)
        }
    }

    fun setPlaylistThumbnail(thumbnailUrl: String?) {
        val playlistId = _uiState.value.selectedPlaylist?.playlistId ?: return
        viewModelScope.launch {
            val result = repository.setPlaylistThumbnail(playlistId, thumbnailUrl)
            _uiState.update { it.copy(snackbarMessage = result.message) }
        }
    }

    fun openVideoPlayer(video: VideoItemUiModel) {
        _uiState.update { it.copy(playingVideo = video) }
    }

    fun closeVideoPlayer() {
        _uiState.update { it.copy(playingVideo = null) }
    }

    fun clearSnackbar() {
        _uiState.update { it.copy(snackbarMessage = null) }
    }

    fun getCurrentApiKey(): String = apiKeyPrefs.getApiKey()

    fun saveApiKey(newKey: String) {
        apiKeyPrefs.setApiKey(newKey)
        _uiState.update { it.copy(snackbarMessage = "Đã lưu YouTube API Key") }
    }
}
