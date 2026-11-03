package com.playlistyoutube.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BrokenImage
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FindReplace
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.PlaylistPlay
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.playlistyoutube.app.data.local.entities.PlaylistWithChannel
import com.playlistyoutube.app.data.local.entities.VideoItemUiModel
import com.playlistyoutube.app.ui.theme.ErrorRed
import com.playlistyoutube.app.ui.theme.PrimaryGreen
import com.playlistyoutube.app.ui.theme.SurfaceDark
import com.playlistyoutube.app.ui.theme.SurfaceElevated
import com.playlistyoutube.app.ui.theme.TextSecondary
import com.playlistyoutube.app.ui.theme.TitleGreen
import com.playlistyoutube.app.util.FormatUtils

/**
 * Thẻ hiển thị Playlist (Tương đương PlaylistYoutube.vue)
 */
@Composable
fun PlaylistCard(
    playlist: PlaylistWithChannel,
    onSelect: () -> Unit,
    onUpdate: () -> Unit,
    onDelete: () -> Unit,
    onShare: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.Black)
            ) {
                if (!playlist.thumbnails.isNullOrBlank()) {
                    AsyncImage(
                        model = playlist.thumbnails,
                        contentDescription = playlist.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.BrokenImage,
                        contentDescription = null,
                        tint = Color.Gray,
                        modifier = Modifier
                            .size(48.dp)
                            .align(Alignment.Center)
                    )
                }

                // Badge hiển thị số lượng video (ItemCount)
                Surface(
                    color = Color.Black.copy(alpha = 0.75f),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlaylistPlay,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${playlist.itemCount} video",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = playlist.title,
                    color = PrimaryGreen,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )

                Box {
                    IconButton(onClick = { menuExpanded = true }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = "Menu",
                            tint = Color.White
                        )
                    }
                    DropdownMenu(
                        expanded = menuExpanded,
                        onDismissRequest = { menuExpanded = false },
                        modifier = Modifier.background(SurfaceElevated)
                    ) {
                        DropdownMenuItem(
                            text = { Text("Cập nhật danh sách phát", color = Color.White) },
                            leadingIcon = {
                                Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White)
                            },
                            onClick = {
                                menuExpanded = false
                                onUpdate()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Chia sẻ", color = Color.White) },
                            leadingIcon = {
                                Icon(Icons.Default.Share, contentDescription = null, tint = Color.White)
                            },
                            onClick = {
                                menuExpanded = false
                                onShare()
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Xóa danh sách phát", color = ErrorRed) },
                            leadingIcon = {
                                Icon(Icons.Default.Delete, contentDescription = null, tint = ErrorRed)
                            },
                            onClick = {
                                menuExpanded = false
                                onDelete()
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                if (!playlist.channelAvatar.isNullOrBlank()) {
                    AsyncImage(
                        model = playlist.channelAvatar,
                        contentDescription = playlist.channelTitle,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(
                    text = playlist.channelTitle,
                    color = Color.White,
                    fontSize = 14.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

/**
 * Thẻ hiển thị từng Video trong Playlist (Tương đương VideoYoutube.vue)
 */
@Composable
fun VideoItemCard(
    displayIndex: Int,
    video: VideoItemUiModel,
    playlistTitle: String,
    onClickVideo: () -> Unit,
    onReplaceVideo: () -> Unit,
    onDeleteVideo: () -> Unit,
    onShareVideo: () -> Unit,
    onSetAsPlaylistThumbnail: () -> Unit,
    onOpenInYouTube: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }
    val notFound = video.isHiddenOrDeleted

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .clickable { onClickVideo() }
            .padding(vertical = 8.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Số thứ tự (Index)
        Text(
            text = displayIndex.toString(),
            color = TextSecondary,
            fontSize = 14.sp,
            modifier = Modifier
                .width(34.dp)
                .padding(end = 4.dp)
        )

        // Thumbnail 16:9 kèm thời lượng
        Box(
            modifier = Modifier
                .width(148.dp)
                .aspectRatio(16f / 9f)
                .clip(RoundedCornerShape(8.dp))
                .background(Color.Black)
        ) {
            if (!notFound && !video.thumbnails.isNullOrBlank()) {
                AsyncImage(
                    model = video.thumbnails,
                    contentDescription = video.videoTitle,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                val formattedDuration = FormatUtils.formatDuration(video.duration)
                if (formattedDuration.isNotBlank()) {
                    Surface(
                        color = Color.Black.copy(alpha = 0.75f),
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(4.dp)
                    ) {
                        Text(
                            text = formattedDuration,
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                        )
                    }
                }
            } else {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.BrokenImage,
                        contentDescription = "Not Found",
                        tint = ErrorRed,
                        modifier = Modifier.size(28.dp)
                    )
                    Text(
                        text = "Unavailable",
                        color = Color.Gray,
                        fontSize = 10.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(10.dp))

        // Thông tin Video (Title, Channel, ViewCount, PublishedAt)
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = if (notFound) "[Not Found] (${video.videoId})" else video.videoTitle.orEmpty(),
                color = if (notFound) ErrorRed else TitleGreen,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(4.dp))

            if (!notFound) {
                Text(
                    text = video.channelTitle.orEmpty(),
                    color = TextSecondary,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${FormatUtils.formatViewCount(video.viewCount)} lượt xem • ${FormatUtils.timeAgo(video.publishedAt)}",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            } else {
                Text(
                    text = "Ngày thêm: ${FormatUtils.formatAddedAt(video.addedAt)}",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Nút Menu 3 chấm (Tương đương MenuPopup.vue)
        Box {
            IconButton(onClick = { menuExpanded = true }) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = "More actions",
                    tint = Color.White
                )
            }

            DropdownMenu(
                expanded = menuExpanded,
                onDismissRequest = { menuExpanded = false },
                modifier = Modifier.background(SurfaceElevated)
            ) {
                DropdownMenuItem(
                    text = { Text("Phát video trong ứng dụng", color = Color.White) },
                    leadingIcon = {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, tint = PrimaryGreen)
                    },
                    onClick = {
                        menuExpanded = false
                        onClickVideo()
                    }
                )
                DropdownMenuItem(
                    text = { Text("Mở bằng ứng dụng YouTube", color = Color.White) },
                    leadingIcon = {
                        Icon(Icons.Default.OpenInNew, contentDescription = null, tint = Color.White)
                    },
                    onClick = {
                        menuExpanded = false
                        onOpenInYouTube()
                    }
                )
                DropdownMenuItem(
                    text = { Text("Thay thế video", color = Color.White) },
                    leadingIcon = {
                        Icon(Icons.Default.FindReplace, contentDescription = null, tint = Color.White)
                    },
                    onClick = {
                        menuExpanded = false
                        onReplaceVideo()
                    }
                )
                DropdownMenuItem(
                    text = { Text("Xóa khỏi $playlistTitle", color = ErrorRed) },
                    leadingIcon = {
                        Icon(Icons.Default.Delete, contentDescription = null, tint = ErrorRed)
                    },
                    onClick = {
                        menuExpanded = false
                        onDeleteVideo()
                    }
                )
                DropdownMenuItem(
                    text = { Text("Chia sẻ", color = Color.White) },
                    leadingIcon = {
                        Icon(Icons.Default.Share, contentDescription = null, tint = Color.White)
                    },
                    onClick = {
                        menuExpanded = false
                        onShareVideo()
                    }
                )
                HorizontalDivider(color = Color.White.copy(alpha = 0.15f))
                DropdownMenuItem(
                    text = { Text("Đặt làm hình nền của danh sách phát", color = Color.White) },
                    leadingIcon = {
                        Icon(Icons.Default.Image, contentDescription = null, tint = Color.White)
                    },
                    onClick = {
                        menuExpanded = false
                        onSetAsPlaylistThumbnail()
                    }
                )
            }
        }
    }
}

/**
 * Thẻ hiển thị Video bị ẩn / đã bị xóa (Tương đương HiddenVideo.vue)
 */
@Composable
fun HiddenVideoCard(
    video: VideoItemUiModel,
    playlistTitle: String,
    onReplaceVideo: () -> Unit,
    onDeleteVideo: () -> Unit,
    onOpenInYouTube: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(SurfaceDark)
            .clickable { onOpenInYouTube() }
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .width(120.dp)
                .aspectRatio(16f / 9f)
                .clip(RoundedCornerShape(8.dp))
                .background(Color.Black),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.BrokenImage,
                contentDescription = "Hidden Video",
                tint = ErrorRed,
                modifier = Modifier.size(32.dp)
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = video.videoId,
                color = TitleGreen,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Ngày thêm: ${FormatUtils.formatAddedAt(video.addedAt)}",
                color = TextSecondary,
                fontSize = 13.sp
            )
            Text(
                text = "Vị trí Index: #${video.indexVideo}",
                color = TextSecondary,
                fontSize = 12.sp
            )
        }

        Box {
            IconButton(onClick = { menuExpanded = true }) {
                Icon(Icons.Default.MoreVert, contentDescription = "Menu", tint = Color.White)
            }
            DropdownMenu(
                expanded = menuExpanded,
                onDismissRequest = { menuExpanded = false },
                modifier = Modifier.background(SurfaceElevated)
            ) {
                DropdownMenuItem(
                    text = { Text("Thay thế video", color = Color.White) },
                    leadingIcon = {
                        Icon(Icons.Default.FindReplace, contentDescription = null, tint = PrimaryGreen)
                    },
                    onClick = {
                        menuExpanded = false
                        onReplaceVideo()
                    }
                )
                DropdownMenuItem(
                    text = { Text("Xóa khỏi $playlistTitle", color = ErrorRed) },
                    leadingIcon = {
                        Icon(Icons.Default.Delete, contentDescription = null, tint = ErrorRed)
                    },
                    onClick = {
                        menuExpanded = false
                        onDeleteVideo()
                    }
                )
                DropdownMenuItem(
                    text = { Text("Kiểm tra URL trên YouTube", color = Color.White) },
                    leadingIcon = {
                        Icon(Icons.Default.OpenInNew, contentDescription = null, tint = Color.White)
                    },
                    onClick = {
                        menuExpanded = false
                        onOpenInYouTube()
                    }
                )
            }
        }
    }
}
