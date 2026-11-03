use crate::app::{App, Message};
use iced::widget::{Column, container, row, space, text};
use iced::{Alignment, Element, Length};
use shadcn_iced::alert::{self, alert};
use shadcn_iced::badge::{self, badge};
use shadcn_iced::button::{self, button};
use shadcn_iced::dialog::dialog;
use shadcn_iced::input::input;
use shadcn_iced::prelude::*;

impl App {
    pub fn view_top_bar(&self) -> Element<'_, Message> {
        let left_nav: Element<'_, Message> =
            if let Some(ref pl) = self.playlists_state.selected_playlist {
                let pl_title = pl.title.as_deref().unwrap_or(&pl.playlist_id);
                row![
                    button("Danh sách Playlist")
                        .variant(button::Variant::Outline)
                        .icon(lucide::ARROW_LEFT)
                        .on_press(Message::BackToPlaylists),
                    text(pl_title).size(18),
                    badge(format!("{} videos", self.videos_state.total_videos))
                        .variant(badge::Variant::Secondary),
                ]
                .spacing(12)
                .align_y(Alignment::Center)
                .into()
            } else {
                row![
                    text("YouTube Playlist Manager").size(20),
                    badge(format!("{} playlists", self.playlists_state.playlists.len()))
                        .variant(badge::Variant::Secondary),
                ]
                .spacing(12)
                .align_y(Alignment::Center)
                .into()
            };

        let api_status_badge = if self.settings_state.api_key.is_empty() {
            badge("Chưa có API Key").variant(badge::Variant::Destructive)
        } else {
            badge("API Key Sẵn sàng").variant(badge::Variant::Outline)
        };

        let theme_label = match self.settings_state.theme_mode {
            Mode::Dark => "Light",
            Mode::Light => "Dark",
        };

        let right_actions = row![
            api_status_badge,
            button("Thêm Playlist")
                .icon(lucide::PLUS)
                .on_press(Message::OpenAddPlaylistModal),
            button("API Key")
                .variant(button::Variant::Outline)
                .icon(lucide::KEY)
                .on_press(Message::OpenApiKeyModal),
            button(theme_label)
                .variant(button::Variant::Ghost)
                .on_press(Message::ToggleTheme),
        ]
        .spacing(8)
        .align_y(Alignment::Center);

        container(
            row![left_nav, space::horizontal(), right_actions]
                .align_y(Alignment::Center)
                .width(Length::Fill),
        )
        .padding([14, 24])
        .into()
    }

    pub fn view_status_banner(&self) -> Element<'_, Message> {
        if let Some((ref msg, is_error)) = self.status_banner {
            let variant = if is_error {
                alert::Variant::Destructive
            } else {
                alert::Variant::Default
            };
            container(
                alert(if is_error {
                    "Thông báo lỗi"
                } else {
                    "Thành công"
                })
                .description(msg.as_str())
                .variant(variant)
                .action(
                    button("Đóng")
                        .size(button::Size::Xs)
                        .variant(button::Variant::Ghost)
                        .on_press(Message::DismissBanner),
                ),
            )
            .padding([0, 24])
            .into()
        } else {
            Column::new().into()
        }
    }

    pub fn view_api_key_modal<'a>(&'a self, base: Element<'a, Message>) -> Element<'a, Message> {
        dialog(base, true)
            .title("Cấu hình YouTube Data API v3 Key")
            .description(
                "Ứng dụng tự động đọc biến YOUTUBE_API_KEY từ file .env. Bạn cũng có thể nhập hoặc đổi trực tiếp tại đây.",
            )
            .width(460.0)
            .on_close(Message::CloseModal)
            .content(
                input("AIzaSy...", &self.settings_state.api_key_draft)
                    .on_input(Message::ApiKeyDraftChanged)
                    .on_submit(Message::SaveApiKey),
            )
            .footer_buttons(|fill| {
                let cancel_btn = button("Hủy")
                    .variant(button::Variant::Outline)
                    .on_press(Message::CloseModal);
                let save_btn = button("Lưu API Key").on_press(Message::SaveApiKey);
                if fill {
                    vec![
                        cancel_btn.width(Length::Fill).into(),
                        save_btn.width(Length::Fill).into(),
                    ]
                } else {
                    vec![cancel_btn.into(), save_btn.into()]
                }
            })
            .into()
    }
}
