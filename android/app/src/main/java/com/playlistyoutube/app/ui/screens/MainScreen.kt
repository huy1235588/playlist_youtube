package com.playlistyoutube.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.PlaylistAdd
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playlistyoutube.app.data.local.entities.PlaylistWithChannel
import com.playlistyoutube.app.data.local.entities.VideoItemUiModel
import com.playlistyoutube.app.ui.components.AddPlaylistDialog
import com.playlistyoutube.app.ui.components.ApiKeyDialog
import com.playlistyoutube.app.ui.components.DeleteConfirmDialog
import com.playlistyoutube.app.ui.components.FilterBottomSheet
import com.playlistyoutube.app.ui.components.HiddenVideoCard
import com.playlistyoutube.app.ui.components.PlaylistCard
import com.playlistyoutube.app.ui.components.ReplaceVideoDialog
import com.playlistyoutube.app.ui.components.UpdatePlaylistDialog
import com.playlistyoutube.app.ui.components.VideoItemCard
import com.playlistyoutube.app.ui.components.YouTubePlayerDialog
import com.playlistyoutube.app.ui.theme.BackgroundDark
import com.playlistyoutube.app.ui.theme.ErrorRed
import com.playlistyoutube.app.ui.theme.PrimaryGreen
import com.playlistyoutube.app.ui.theme.SurfaceDark
import com.playlistyoutube.app.ui.theme.SurfaceElevated
import com.playlistyoutube.app.ui.theme.TextSecondary
import com.playlistyoutube.app.ui.viewmodel.MainViewModel

@Composable
fun MainScreen(viewModel: MainViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    // Trạng thái mở/đóng các Popup/Dialog
    var showSettingMenu by remember { mutableStateOf(false) }
    var showFilterSheet by remember { mutableStateOf(false) }
    var showAddPlaylistDialog by remember { mutableStateOf(false) }
    var playlistToUpdate by remember { mutableStateOf<PlaylistWithChannel?>(null) }
    var playlistToDelete by remember { mutableStateOf<PlaylistWithChannel?>(null) }
    var videoToReplace by remember { mutableStateOf<VideoItemUiModel?>(null) }
    var videoToDelete by remember { mutableStateOf<VideoItemUiModel?>(null) }
    var showApiKeyDialog by remember { mutableStateOf(false) }

    val selectedPlaylist = uiState.selectedPlaylist

    // Xử lý nút Back vật lý khi đang ở trong một Playlist
    BackHandler(enabled = selectedPlaylist != null) {
        if (uiState.isShowHiddenVideos) {
            viewModel.toggleShowHiddenVideos()
        } else {
            viewModel.backToPlaylistSelection()
        }
    }

    // Hiển thị thông báo Snackbar
    LaunchedEffect(uiState.snackbarMessage) {
        uiState.snackbarMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearSnackbar()
        }
    }

    Scaffold(
        containerColor = BackgroundDark,
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        floatingActionButton = {
            if (selectedPlaylist == null) {
                ExtendedFloatingActionButton(
                    onClick = { showAddPlaylistDialog = true },
                    containerColor = PrimaryGreen,
                    contentColor = Color.Black,
                    icon = { Icon(Icons.Default.Add, contentDescription = "Add Playlist") },
                    text = { Text("Thêm Playlist", fontWeight = FontWeight.Bold) }
                )
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 12.dp)
        ) {
            // ==================== THANH CÔNG CỤ TRÊN CÙNG (SEARCH + SETTING + FILTER) ====================
            Spacer(modifier = Modifier.height(8.dp))
            var isSearchFocused by remember { mutableStateOf(false) }

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (selectedPlaylist != null) {
                    IconButton(
                        onClick = { viewModel.backToPlaylistSelection() },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back to Playlists",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }

                // Ô tìm kiếm Video gọn gàng trên 1 dòng (Tương đương InputSearch.vue)
                val isSearchEnabled = selectedPlaylist != null
                val borderColor = when {
                    !isSearchEnabled -> Color.White.copy(alpha = 0.1f)
                    isSearchFocused -> PrimaryGreen
                    else -> Color.White.copy(alpha = 0.22f)
                }

                BasicTextField(
                    value = uiState.searchQuery,
                    onValueChange = { viewModel.onSearchQueryChanged(it) },
                    enabled = isSearchEnabled,
                    singleLine = true,
                    textStyle = TextStyle(
                        color = Color.White,
                        fontSize = 14.sp
                    ),
                    cursorBrush = SolidColor(PrimaryGreen),
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isSearchEnabled) SurfaceDark else SurfaceDark.copy(alpha = 0.5f))
                        .border(1.dp, borderColor, RoundedCornerShape(20.dp))
                        .onFocusChanged { isSearchFocused = it.isFocused }
                        .padding(horizontal = 12.dp),
                    decorationBox = { innerTextField ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = null,
                                tint = TextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier.weight(1f),
                                contentAlignment = Alignment.CenterStart
                            ) {
                                if (uiState.searchQuery.isEmpty()) {
                                    Text(
                                        text = "Search...",
                                        color = TextSecondary,
                                        fontSize = 14.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                                innerTextField()
                            }
                            if (uiState.searchQuery.isNotEmpty()) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.Default.Clear,
                                    contentDescription = "Clear",
                                    tint = TextSecondary,
                                    modifier = Modifier
                                        .size(18.dp)
                                        .clickable { viewModel.onSearchQueryChanged("") }
                                )
                            }
                        }
                    }
                )

                // Nút Filter (Tương đương FIlterMenu.vue)
                if (selectedPlaylist != null) {
                    OutlinedButton(
                        onClick = { showFilterSheet = true },
                        modifier = Modifier.height(40.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 0.dp),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Sort,
                            contentDescription = "Filter",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Filter",
                            color = Color.White,
                            fontSize = 13.sp,
                            maxLines = 1
                        )
                    }
                }

                // Nút Settings & Dropdown (Tương đương Setting.vue + SettingDropdown.vue)
                Box {
                    IconButton(
                        onClick = { showSettingMenu = true },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = showSettingMenu,
                        onDismissRequest = { showSettingMenu = false },
                        modifier = Modifier.background(SurfaceElevated)
                    ) {
                        DropdownMenuItem(
                            text = { Text("Add new playlist", color = Color.White) },
                            leadingIcon = {
                                Icon(Icons.Default.PlaylistAdd, contentDescription = null, tint = PrimaryGreen)
                            },
                            onClick = {
                                showSettingMenu = false
                                showAddPlaylistDialog = true
                            }
                        )

                        if (selectedPlaylist != null) {
                            DropdownMenuItem(
                                text = {
                                    val label = if (uiState.isShowHiddenVideos) {
                                        "Show all videos"
                                    } else {
                                        "Show hidden videos (${uiState.hiddenVideos.size})"
                                    }
                                    Text(label, color = Color.White)
                                },
                                leadingIcon = {
                                    Icon(
                                        imageVector = if (uiState.isShowHiddenVideos) {
                                            Icons.Default.Visibility
                                        } else {
                                            Icons.Default.VisibilityOff
                                        },
                                        contentDescription = null,
                                        tint = Color.White
                                    )
                                },
                                onClick = {
                                    showSettingMenu = false
                                    viewModel.toggleShowHiddenVideos()
                                }
                            )

                            DropdownMenuItem(
                                text = { Text("Update Playlist", color = Color.White) },
                                leadingIcon = {
                                    Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White)
                                },
                                onClick = {
                                    showSettingMenu = false
                                    playlistToUpdate = selectedPlaylist
                                }
                            )

                            DropdownMenuItem(
                                text = { Text("Change playlist", color = Color.White) },
                                leadingIcon = {
                                    Icon(Icons.Default.SwapHoriz, contentDescription = null, tint = Color.White)
                                },
                                onClick = {
                                    showSettingMenu = false
                                    viewModel.backToPlaylistSelection()
                                }
                            )

                            DropdownMenuItem(
                                text = { Text("Delete playlist", color = ErrorRed) },
                                leadingIcon = {
                                    Icon(Icons.Default.Delete, contentDescription = null, tint = ErrorRed)
                                },
                                onClick = {
                                    showSettingMenu = false
                                    playlistToDelete = selectedPlaylist
                                }
                            )
                        }

                        HorizontalDivider(color = Color.White.copy(alpha = 0.12f))

                        DropdownMenuItem(
                            text = { Text("Cấu hình YouTube API Key", color = Color.LightGray) },
                            leadingIcon = {
                                Icon(Icons.Default.Key, contentDescription = null, tint = PrimaryGreen)
                            },
                            onClick = {
                                showSettingMenu = false
                                showApiKeyDialog = true
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // ==================== NỘI DUNG CHÍNH (PLAYLISTS HOẶC VIDEOS) ====================
            if (selectedPlaylist == null) {
                // Màn hình danh sách Playlist
                Text(
                    text = "Playlist",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(vertical = 6.dp)
                )

                if (uiState.playlists.isEmpty()) {
                    // Tương đương NoPlaylistVideo.vue
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(24.dp)
                        ) {
                            Text(
                                text = "Chưa có danh sách phát nào",
                                color = Color.White,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Nhấn nút bên dưới để tải và lưu Playlist từ YouTube trực tiếp vào thiết bị.",
                                color = TextSecondary,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Button(
                                onClick = { showAddPlaylistDialog = true },
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                            ) {
                                Icon(Icons.Default.PlaylistAdd, contentDescription = null, tint = Color.Black)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Add New Playlist", color = Color.Black, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        contentPadding = PaddingValues(bottom = 88.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        itemsIndexed(
                            items = uiState.playlists,
                            key = { _, item -> item.playlistId }
                        ) { _, item ->
                            PlaylistCard(
                                playlist = item,
                                onSelect = { viewModel.selectPlaylist(item) },
                                onUpdate = { playlistToUpdate = item },
                                onDelete = { playlistToDelete = item },
                                onShare = {
                                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(
                                            Intent.EXTRA_TEXT,
                                            "https://www.youtube.com/playlist?list=${item.playlistId}"
                                        )
                                    }
                                    context.startActivity(Intent.createChooser(shareIntent, "Chia sẻ Playlist"))
                                }
                            )
                        }
                    }
                }
            } else {
                // Màn hình danh sách Video trong Playlist đã chọn
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = selectedPlaylist.title,
                            color = PrimaryGreen,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = if (uiState.isShowHiddenVideos) {
                                "Đang hiển thị ${uiState.hiddenVideos.size} video bị ẩn / lỗi"
                            } else {
                                "${selectedPlaylist.channelTitle} • ${selectedPlaylist.itemCount} video"
                            },
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }

                    if (uiState.hiddenVideos.isNotEmpty()) {
                        OutlinedButton(
                            onClick = { viewModel.toggleShowHiddenVideos() },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = if (uiState.isShowHiddenVideos) "Tất cả video" else "Video ẩn (${uiState.hiddenVideos.size})",
                                color = if (uiState.isShowHiddenVideos) PrimaryGreen else ErrorRed,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                if (uiState.isLoading && uiState.videos.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryGreen)
                    }
                } else if (uiState.isShowHiddenVideos) {
                    // Danh sách Video bị ẩn (Tương đương HiddenVideo.vue)
                    if (uiState.hiddenVideos.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("Không có video bị ẩn nào trong danh sách phát này.", color = TextSecondary)
                        }
                    } else {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                            contentPadding = PaddingValues(bottom = 24.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            itemsIndexed(
                                items = uiState.hiddenVideos,
                                key = { _, v -> v.playlistItemId }
                            ) { _, hiddenVideo ->
                                HiddenVideoCard(
                                    video = hiddenVideo,
                                    playlistTitle = selectedPlaylist.title,
                                    onReplaceVideo = { videoToReplace = hiddenVideo },
                                    onDeleteVideo = { videoToDelete = hiddenVideo },
                                    onOpenInYouTube = {
                                        val intent = Intent(
                                            Intent.ACTION_VIEW,
                                            Uri.parse("https://www.youtube.com/watch?v=${hiddenVideo.videoId}")
                                        )
                                        context.startActivity(intent)
                                    }
                                )
                            }
                        }
                    }
                } else {
                    // Danh sách Video chính thức có phân trang cuộn vô hạn (Infinite Scroll)
                    val listState = rememberLazyListState()

                    val shouldLoadMore by remember {
                        derivedStateOf {
                            val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
                            val totalItems = listState.layoutInfo.totalItemsCount
                            totalItems > 0 && lastVisible >= totalItems - 5
                        }
                    }

                    LaunchedEffect(shouldLoadMore) {
                        if (shouldLoadMore) {
                            viewModel.loadNextPage()
                        }
                    }

                    LazyColumn(
                        state = listState,
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                        contentPadding = PaddingValues(bottom = 24.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        itemsIndexed(
                            items = uiState.videos,
                            key = { _, v -> v.playlistItemId }
                        ) { index, video ->
                            VideoItemCard(
                                displayIndex = index + 1,
                                video = video,
                                playlistTitle = selectedPlaylist.title,
                                onClickVideo = {
                                    if (!video.isHiddenOrDeleted) {
                                        viewModel.openVideoPlayer(video)
                                    } else {
                                        videoToReplace = video
                                    }
                                },
                                onReplaceVideo = { videoToReplace = video },
                                onDeleteVideo = { videoToDelete = video },
                                onShareVideo = {
                                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(
                                            Intent.EXTRA_TEXT,
                                            "https://www.youtube.com/watch?v=${video.videoId}"
                                        )
                                    }
                                    context.startActivity(Intent.createChooser(shareIntent, "Chia sẻ Video"))
                                },
                                onSetAsPlaylistThumbnail = {
                                    viewModel.setPlaylistThumbnail(video.thumbnails)
                                },
                                onOpenInYouTube = {
                                    val intent = Intent(
                                        Intent.ACTION_VIEW,
                                        Uri.parse("https://www.youtube.com/watch?v=${video.videoId}")
                                    )
                                    context.startActivity(intent)
                                }
                            )
                            HorizontalDivider(color = Color.White.copy(alpha = 0.05f))
                        }

                        if (uiState.isLoadingMore) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator(
                                        color = PrimaryGreen,
                                        modifier = Modifier.size(28.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // ==================== CÁC DIALOG / BOTTOM SHEET ====================

    if (showFilterSheet) {
        FilterBottomSheet(
            currentColumn = uiState.sortColumn,
            currentOrder = uiState.sortOrder,
            onSelectSort = { col, ord ->
                viewModel.onSortSelected(col, ord)
                showFilterSheet = false
            },
            onDismiss = { showFilterSheet = false }
        )
    }

    if (showAddPlaylistDialog) {
        AddPlaylistDialog(
            isLoading = uiState.isLoading,
            progressMessage = uiState.progressMessage,
            onDismiss = { showAddPlaylistDialog = false },
            onSubmit = { url, callback ->
                viewModel.addPlaylist(url) { res ->
                    callback(res.success, res.message)
                }
            }
        )
    }

    playlistToUpdate?.let { target ->
        UpdatePlaylistDialog(
            playlistName = target.title,
            isLoading = uiState.isLoading,
            progressMessage = uiState.progressMessage,
            onDismiss = { playlistToUpdate = null },
            onConfirm = { callback ->
                viewModel.updatePlaylist(target.playlistId) { res ->
                    callback(res.success, res.message)
                }
            }
        )
    }

    playlistToDelete?.let { target ->
        DeleteConfirmDialog(
            title = target.title,
            subtitle = "Bạn có chắc chắn muốn xóa danh sách phát này khỏi thiết bị?",
            isLoading = uiState.isLoading,
            onDismiss = { playlistToDelete = null },
            onConfirm = {
                viewModel.deletePlaylist(target.playlistId) {
                    playlistToDelete = null
                }
            }
        )
    }

    videoToReplace?.let { target ->
        ReplaceVideoDialog(
            currentVideoId = target.videoId,
            isLoading = uiState.isLoading,
            onDismiss = { videoToReplace = null },
            onSubmit = { newUrl, callback ->
                viewModel.replaceVideo(target.playlistItemId, newUrl) { res ->
                    callback(res.success, res.message)
                }
            }
        )
    }

    videoToDelete?.let { target ->
        DeleteConfirmDialog(
            title = target.videoTitle ?: target.videoId,
            subtitle = "Are you sure want to delete this video?",
            isLoading = uiState.isLoading,
            onDismiss = { videoToDelete = null },
            onConfirm = {
                viewModel.deleteVideo(target.videoId) {
                    videoToDelete = null
                }
            }
        )
    }

    if (showApiKeyDialog) {
        ApiKeyDialog(
            currentKey = viewModel.getCurrentApiKey(),
            onDismiss = { showApiKeyDialog = false },
            onSave = { newKey -> viewModel.saveApiKey(newKey) }
        )
    }

    uiState.playingVideo?.let { video ->
        YouTubePlayerDialog(
            video = video,
            onDismiss = { viewModel.closeVideoPlayer() }
        )
    }
}
