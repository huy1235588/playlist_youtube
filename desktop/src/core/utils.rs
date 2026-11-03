/// Chuyển đổi số lượt xem sang định dạng K, M, B giống VideoYoutube.vue
pub fn format_view_count(count: Option<i64>) -> String {
    let Some(c) = count else {
        return "0".to_string();
    };
    if c >= 1_000_000_000 {
        if c >= 10_000_000_000 {
            format!("{} B", c / 1_000_000_000)
        } else {
            format!("{:.1} B", c as f64 / 1_000_000_000.0)
        }
    } else if c >= 1_000_000 {
        if c >= 10_000_000 {
            format!("{} M", c / 1_000_000)
        } else {
            format!("{:.1} M", c as f64 / 1_000_000.0)
        }
    } else if c >= 1_000 {
        if c >= 10_000 {
            format!("{} K", c / 1_000)
        } else {
            format!("{:.1} K", c as f64 / 1_000.0)
        }
    } else {
        c.to_string()
    }
}

/// Chuyển đổi thời lượng ISO-8601 (VD: PT1H2M10S, PT4M5S) sang H:MM:SS hoặc M:SS
pub fn format_duration(duration: Option<&str>) -> String {
    let Some(raw) = duration else {
        return "--:--".to_string();
    };
    if !raw.starts_with("PT") {
        return raw.to_string();
    }

    let mut hours: u32 = 0;
    let mut minutes: u32 = 0;
    let mut seconds: u32 = 0;
    let mut current_num = String::new();

    for ch in raw[2..].chars() {
        if ch.is_ascii_digit() {
            current_num.push(ch);
        } else {
            let val = current_num.parse::<u32>().unwrap_or(0);
            current_num.clear();
            match ch {
                'H' => hours = val,
                'M' => minutes = val,
                'S' => seconds = val,
                _ => {}
            }
        }
    }

    if hours > 0 {
        format!("{hours}:{minutes:02}:{seconds:02}")
    } else {
        format!("{minutes}:{seconds:02}")
    }
}

/// Làm gọn chuỗi thời gian ISO-8601 thành YYYY-MM-DD
pub fn format_short_date(date_str: Option<&str>) -> String {
    let Some(s) = date_str else {
        return "N/A".to_string();
    };
    s.split(['T', ' ']).next().unwrap_or(s).to_string()
}

/// Trích xuất Playlist ID từ URL hoặc chuỗi trực tiếp
pub fn extract_playlist_id(input: &str) -> Option<String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }
    if let Some(idx) = trimmed.find("list=") {
        let after = &trimmed[idx + 5..];
        let id = after.split(['&', '#', ' ']).next().unwrap_or("").trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }
    if !trimmed.contains('/') && !trimmed.contains('?') && trimmed.len() >= 10 {
        return Some(trimmed.to_string());
    }
    None
}

/// Trích xuất Video ID từ URL hoặc chuỗi trực tiếp
pub fn extract_video_id(input: &str) -> Option<String> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }
    if let Some(idx) = trimmed.find("v=") {
        let after = &trimmed[idx + 2..];
        let id = after.split(['&', '#', ' ']).next().unwrap_or("").trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }
    if let Some(idx) = trimmed.find("youtu.be/") {
        let after = &trimmed[idx + 9..];
        let id = after
            .split(['?', '&', '#', '/'])
            .next()
            .unwrap_or("")
            .trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }
    if !trimmed.contains('/') && !trimmed.contains('?') && trimmed.len() >= 8 {
        return Some(trimmed.to_string());
    }
    None
}
