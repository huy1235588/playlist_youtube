use crate::app::{App, Message};
use crate::core::utils::format_short_date;
use iced::widget::{Column, center, column, container, row, space, text};
use iced::{Alignment, Element, Length, Theme};
use shadcn_iced::alert_dialog::alert_dialog;
use shadcn_iced::badge::{self, badge};
use shadcn_iced::button::{self, button};
use shadcn_iced::card::card;
use shadcn_iced::dialog::dialog;
use shadcn_iced::empty::empty;
use shadcn_iced::input::input;
use shadcn_iced::prelude::*;
use shadcn_iced::scroll_area::scroll_area;
use shadcn_iced::spinner::spinner;
use shadcn_iced::{font, style, tokens};

impl App {
    pub fn view_playlists_dashboard(&self) -> Element<'_, Message> {
        if self.playlists_state.playlists.is_empty() {
            return center(
                container(
                    empty("Chưa có Playlist nào trong SQLite")
                        .icon(lucide::LIST_VIDEO)
                        .description(
                            "Nhấn 'Thêm Playlist' và dán đường dẫn YouTube Playlist (?list=...) để tải dữ liệu về SQLite.",
                        )
                        .bordered(true)
                        .content(
                            button("Thêm Playlist đầu tiên")
                                .icon(lucide::PLUS)
                                .on_press(Message::OpenAddPlaylistModal),
                        ),
                )
                .max_width(520),
            )
            .padding(24)
            .into();
        }

        let mut list_col = Column::new().spacing(12).width(Length::Fill);

        for pl in &self.playlists_state.playlists {
            let title = pl
                .title
                .clone()
                .unwrap_or_else(|| "[Không tìm thấy tiêu đề]".to_string());
            let channel_name = pl
                .channel_title
                .clone()
                .unwrap_or_else(|| "Kênh không xác định".to_string());
            let pub_date = format_short_date(pl.published_at.as_deref());
            let pid = pl.playlist_id.clone();
            let yt_url = format!("https://www.youtube.com/playlist?list={pid}");

            let thumbnail_el =
                self.thumbnails
                    .view_thumbnail(pl.thumbnails.as_deref(), 160.0, 90.0);

            let info_col = column![
                text(title.clone())
                    .size(style::text::BASE)
                    .font(font::heading(iced::font::Weight::Medium)),
                text(format!(
                    "Kênh: {channel_name}  •  Ngày tạo: {pub_date}  •  ID: {pid}"
                ))
                .size(style::text::SM)
                .style(|theme: &Theme| text::Style {
                    color: Some(tokens(theme).palette.muted_foreground),
                }),
            ]
            .spacing(6)
            .width(Length::Fill);

            let body_row = row![
                thumbnail_el,
                info_col,
                badge(format!("{} videos", pl.item_count)).variant(badge::Variant::Secondary),
            ]
            .spacing(16)
            .align_y(Alignment::Center)
            .width(Length::Fill);

            let card_item = card()
                .content(body_row)
                .footer(
                    row![
                        button("Xem tất cả Video")
                            .icon(lucide::PLAY)
                            .on_press(Message::SelectPlaylist(pid.clone())),
                        button("Mở trên YouTube")
                            .variant(button::Variant::Outline)
                            .icon(lucide::EXTERNAL_LINK)
                            .on_press(Message::OpenUrl(yt_url)),
                        space::horizontal(),
                        button("Xóa Playlist")
                            .variant(button::Variant::Destructive)
                            .icon(lucide::TRASH_2)
                            .on_press(Message::OpenDeletePlaylistModal {
                                playlist_id: pid,
                                playlist_title: title,
                            }),
                    ]
                    .spacing(8)
                    .align_y(Alignment::Center)
                    .width(Length::Fill),
                );

            list_col = list_col.push(card_item);
        }

        scroll_area(container(list_col).padding([8, 24]))
            .width(Length::Fill)
            .height(Length::Fill)
            .into()
    }

    pub fn view_add_playlist_modal<'a>(&'a self, base: Element<'a, Message>) -> Element<'a, Message> {
        let mut d = dialog(base, true)
            .title("Thêm Playlist YouTube mới")
            .description(
                "Nhập đường dẫn URL YouTube Playlist (có chứa ?list=...) hoặc mã Playlist ID.",
            )
            .width(460.0)
            .on_close(Message::CloseModal)
            .content(
                input(
                    "https://www.youtube.com/playlist?list=PL...",
                    &self.playlists_state.add_playlist_input,
                )
                .on_input(Message::AddPlaylistInputChanged)
                .on_submit(Message::SubmitAddPlaylist),
            );

        if self.is_busy {
            d = d.content(
                row![
                    spinner(),
                    text("Đang tải dữ liệu từ YouTube Data API v3 và lưu vào SQLite...")
                        .size(13)
                ]
                .spacing(8)
                .align_y(Alignment::Center),
            );
        }

        d.footer_buttons(|fill| {
            let cancel_btn = button("Hủy")
                .variant(button::Variant::Outline)
                .on_press(Message::CloseModal);
            let submit_btn = button(if self.is_busy {
                "Đang tải..."
            } else {
                "Tải & Lưu Playlist"
            })
            .on_press_maybe((!self.is_busy).then_some(Message::SubmitAddPlaylist));

            if fill {
                vec![
                    cancel_btn.width(Length::Fill).into(),
                    submit_btn.width(Length::Fill).into(),
                ]
            } else {
                vec![cancel_btn.into(), submit_btn.into()]
            }
        })
        .into()
    }

    pub fn view_confirm_delete_playlist_modal<'a>(
        &'a self,
        base: Element<'a, Message>,
        playlist_title: &str,
    ) -> Element<'a, Message> {
        alert_dialog(base, true)
            .title("Xóa toàn bộ Playlist?")
            .description(format!(
                "Bạn có chắc chắn muốn xóa playlist \"{playlist_title}\" và danh sách video liên kết khỏi SQLite không?"
            ))
            .cancel("Hủy", Message::CloseModal)
            .destructive_action("Xóa Playlist", Message::ConfirmDeletePlaylist)
            .into()
    }

    pub fn view_confirm_update_playlist_modal<'a>(
        &'a self,
        base: Element<'a, Message>,
        playlist_title: &str,
    ) -> Element<'a, Message> {
        alert_dialog(base, true)
            .title(if self.is_busy {
                "Đang cập nhật Playlist...".to_string()
            } else {
                format!("Cập nhật Playlist \"{playlist_title}\"?")
            })
            .description(
                "Ứng dụng sẽ kiểm tra các video mới được thêm vào Playlist trên YouTube và lưu bổ sung vào SQLite.",
            )
            .cancel("Đóng", Message::CloseModal)
            .action("Cập nhật ngay", Message::ConfirmUpdatePlaylist)
            .into()
    }
}
