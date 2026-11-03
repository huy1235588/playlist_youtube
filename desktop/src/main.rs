#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app;
mod core;
mod features;

use app::App;
use shadcn_iced::prelude::*;
use shadcn_iced::theme::{self, Accent, Radius};

fn main() -> iced::Result {
    // Đọc file .env ở thư mục hiện tại hoặc các thư mục cha (khi chạy từ rust-app hoặc target/release)
    for path in [".env", "../.env", "../../.env", "../../../.env"] {
        if dotenvy::from_filename(path).is_ok() {
            break;
        }
    }

    iced::application(App::new, App::update, App::view)
        .title("YouTube Playlist Manager (Iced + shadcn + SQLite)")
        .theme(|state: &App| {
            theme::zinc(state.settings_state.theme_mode)
                .accent(Accent::Green)
                .radius_preset(Radius::Medium)
                .build()
        })
        .window(iced::window::Settings {
            maximized: true,
            size: iced::Size::new(1240.0, 820.0),
            ..Default::default()
        })
        .shadcn_iced()
        .run()
}
