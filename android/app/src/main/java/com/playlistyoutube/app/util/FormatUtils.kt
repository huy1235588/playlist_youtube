package com.playlistyoutube.app.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlin.math.floor

object FormatUtils {

    /**
     * Trích xuất PlaylistId từ URL YouTube (?list=... hoặc &list=...) hoặc chuỗi PlaylistId trực tiếp.
     */
    fun extractPlaylistId(input: String): String? {
        val trimmed = input.trim()
        if (trimmed.isEmpty()) return null

        val listParamRegex = Regex("[?&]list=([a-zA-Z0-9_-]+)")
        val match = listParamRegex.find(trimmed)
        if (match != null) {
            return match.groupValues[1]
        }

        // Hỗ trợ trường hợp người dùng dán trực tiếp Playlist ID (VD: PL..., UU..., LL..., RD...)
        if (!trimmed.contains("http") && !trimmed.contains("/") && trimmed.length >= 10) {
            return trimmed
        }
        return null
    }

    /**
     * Trích xuất VideoId từ URL YouTube (youtube.com/watch?v=..., youtu.be/..., shorts/...) hoặc VideoId trực tiếp.
     */
    fun extractVideoId(input: String): String? {
        val trimmed = input.trim()
        if (trimmed.isEmpty()) return null

        val vParamRegex = Regex("[?&]v=([a-zA-Z0-9_-]{11})")
        vParamRegex.find(trimmed)?.let { return it.groupValues[1] }

        val shortUrlRegex = Regex("(?:youtu\\.be/|youtube\\.com/(?:shorts/|embed/))([a-zA-Z0-9_-]{11})")
        shortUrlRegex.find(trimmed)?.let { return it.groupValues[1] }

        if (trimmed.matches(Regex("^[a-zA-Z0-9_-]{11}$"))) {
            return trimmed
        }
        return null
    }

    /**
     * Chuyển đổi lượt xem sang định dạng K, M, B giống VideoYoutube.vue
     */
    fun formatViewCount(count: Long?): String {
        val v = count ?: return "0"
        return when {
            v >= 1_000_000_000L -> {
                if (v >= 10_000_000_000L) "${v / 1_000_000_000L} B"
                else String.format(Locale.US, "%.1f B", v / 1_000_000_000.0)
            }
            v >= 1_000_000L -> {
                if (v >= 10_000_000L) "${v / 1_000_000L} M"
                else String.format(Locale.US, "%.1f M", v / 1_000_000.0)
            }
            v >= 1_000L -> {
                if (v >= 10_000L) "${v / 1_000L} K"
                else String.format(Locale.US, "%.1f K", v / 1_000.0)
            }
            else -> v.toString()
        }
    }

    /**
     * Chuyển đổi chuỗi thời lượng ISO-8601 (PT#H#M#S) sang tổng số giây để sắp xếp chính xác.
     */
    fun parseIsoDurationSeconds(duration: String?): Long {
        if (duration.isNullOrBlank()) return 0L
        val regex = Regex("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?")
        val match = regex.matchEntire(duration) ?: return 0L
        val hours = match.groupValues[1].toLongOrNull() ?: 0L
        val minutes = match.groupValues[2].toLongOrNull() ?: 0L
        val seconds = match.groupValues[3].toLongOrNull() ?: 0L
        return hours * 3600L + minutes * 60L + seconds
    }

    /**
     * Định dạng thời lượng ISO-8601 (PT#H#M#S) thành H:MM:SS hoặc M:SS giống VideoYoutube.vue
     */
    fun formatDuration(duration: String?): String {
        if (duration.isNullOrBlank()) return ""
        val regex = Regex("PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?")
        val match = regex.find(duration) ?: return ""
        val hours = match.groupValues[1].toIntOrNull() ?: 0
        val minutes = match.groupValues[2].toIntOrNull() ?: 0
        val seconds = match.groupValues[3].toIntOrNull() ?: 0

        val formattedSeconds = seconds.toString().padStart(2, '0')
        return if (hours > 0) {
            val formattedMinutes = minutes.toString().padStart(2, '0')
            "$hours:$formattedMinutes:$formattedSeconds"
        } else {
            "$minutes:$formattedSeconds"
        }
    }

    /**
     * Tính khoảng cách thời gian phát hành đến hiện tại giống VideoYoutube.vue
     */
    fun timeAgo(dateString: String?): String {
        if (dateString.isNullOrBlank()) return ""
        val parsedDate = parseDate(dateString) ?: return dateString.take(10)
        val diffMillis = System.currentTimeMillis() - parsedDate.time
        val diffInDays = floor(diffMillis.toDouble() / (1000 * 60 * 60 * 24)).toLong()

        return when {
            diffInDays >= 365 -> "${diffInDays / 365} năm trước"
            diffInDays >= 30 -> "${diffInDays / 30} tháng trước"
            diffInDays > 0 -> "$diffInDays ngày trước"
            else -> "Hôm nay"
        }
    }

    /**
     * Định dạng ngày thêm cho video bị ẩn (YYYY-MM-DD) giống HiddenVideo.vue
     */
    fun formatAddedAt(dateString: String?): String {
        if (dateString.isNullOrBlank()) return ""
        return dateString.split("T", " ").firstOrNull() ?: dateString
    }

    private fun parseDate(dateString: String): Date? {
        val formats = listOf(
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd HH:mm:ss"
        )
        for (pattern in formats) {
            try {
                val sdf = SimpleDateFormat(pattern, Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                return sdf.parse(dateString)
            } catch (_: Exception) {
            }
        }
        return null
    }
}
