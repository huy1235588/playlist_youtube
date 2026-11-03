use crate::app::{App, Message};
use crate::core::utils::format_short_date;
use crate::features::playlists::model::Playlist;
use crate::features::settings::ViewLayout;
use iced::widget::{Column, Row, center, column, container, mouse_area, row, space, text};
use iced::{Alignment, Element, Length, Pixels, Theme, mouse};
use shadcn_iced::alert_dialog::alert_dialog;
use shadcn_iced::badge::{self, badge};
use shadcn_iced::button::{self, button, icon_button};
use shadcn_iced::card::card;
use shadcn_iced::dialog::dialog;
use shadcn_iced::empty::empty;
use shadcn_iced::input::input;
use shadcn_iced::prelude::*;
use shadcn_iced::scroll_area::scroll_area;
use shadcn_iced::spinner::spinner;
use shadcn_iced::{font, style, tokens};

const PLAYLIST_GRID_COLUMNS: usize = 3;

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

        let body_col = match self.settings_state.view_layout {
            ViewLayout::Grid => self.view_playlists_grid(),
            ViewLayout::List => self.view_playlists_list(),
        };

        scroll_area(container(body_col).padding([8, 24]))
            .width(Length::Fill)
            .height(Length::Fill)
            .into()
    }

    fn view_playlists_grid(&self) -> Column<'_, Message> {
        let mut grid_col = Column::new().spacing(16).width(Length::Fill);

        for chunk in self.playlists_state.playlists.chunks(PLAYLIST_GRID_COLUMNS) {
            let mut row_items = Row::new().spacing(16).width(Length::Fill);

            for pl in chunk {
                row_items = row_items.push(self.view_playlist_grid_card(pl));
            }

            for _ in chunk.len()..PLAYLIST_GRID_COLUMNS {
                row_items = row_items.push(space::horizontal().width(Length::Fill));
            }

            grid_col = grid_col.push(row_items);
        }

        grid_col
    }

    fn view_playlist_grid_card<'a>(&'a self, pl: &'a Playlist) -> Element<'a, Message> {
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

        let media = mouse_area(
            self.thumbnails
                .view_media_thumbnail(pl.thumbnails.as_deref()),
        )
        .on_press(Message::SelectPlaylist(pid.clone()))
        .interaction(mouse::Interaction::Pointer);

        let header_row = row![
            container(
                text(title.clone())
                    .size(style::text::BASE)
                    .font(font::heading(iced::font::Weight::Medium))
                    .line_height(iced::widget::text::LineHeight::Absolute(Pixels(21.0))),
            )
            .width(Length::Fill)
            .height(Length::Fixed(42.0))
            .clip(true),
            badge(format!("{} videos", pl.item_count)).variant(badge::Variant::Secondary),
        ]
        .spacing(8)
        .align_y(Alignment::Start)
        .width(Length::Fill);

        let meta_box = container(
            column![
                text(format!("Kênh: {channel_name}"))
                    .size(style::text::SM)
                    .line_height(iced::widget::text::LineHeight::Absolute(Pixels(18.0)))
                    .wrapping(iced::widget::text::Wrapping::None)
                    .style(|theme: &Theme| text::Style {
                        color: Some(tokens(theme).palette.muted_foreground),
                    }),
                text(format!("Ngày tạo: {pub_date}  •  ID: {pid}"))
                    .size(style::text::SM)
                    .line_height(iced::widget::text::LineHeight::Absolute(Pixels(18.0)))
                    .wrapping(iced::widget::text::Wrapping::None)
                    .style(|theme: &Theme| text::Style {
                        color: Some(tokens(theme).palette.muted_foreground),
                    }),
            ]
            .spacing(4)
            .width(Length::Fill),
        )
        .width(Length::Fill)
        .height(Length::Fixed(40.0))
        .clip(true);

        let info_section = mouse_area(
            column![header_row, meta_box]
                .spacing(6)
                .width(Length::Fill),
        )
        .on_press(Message::SelectPlaylist(pid.clone()))
        .interaction(mouse::Interaction::Pointer);

        card()
            .width(Length::Fill)
            .media(media)
            .content(info_section)
            .footer(
                row![
                    button("Xem Video")
                        .size(button::Size::Sm)
                        .icon(lucide::PLAY)
                        .on_press(Message::SelectPlaylist(pid.clone())),
                    button("YouTube")
                        .size(button::Size::Sm)
                        .variant(button::Variant::Outline)
                        .icon(lucide::EXTERNAL_LINK)
                        .on_press(Message::OpenUrl(yt_url)),
                    space::horizontal(),
                    icon_button(lucide::TRASH_2)
                        .size(button::Size::Sm)
                        .variant(button::Variant::Destructive)
                        .on_press(Message::OpenDeletePlaylistModal {
                            playlist_id: pid,
                            playlist_title: title,
                        }),
                ]
                .spacing(8)
                .align_y(Alignment::Center)
                .width(Length::Fill),
            )
            .into()
    }

    fn view_playlists_list(&self) -> Column<'_, Message> {
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

            let body_row = mouse_area(
                row![
                    thumbnail_el,
                    info_col,
                    badge(format!("{} videos", pl.item_count)).variant(badge::Variant::Secondary),
                ]
                .spacing(16)
                .align_y(Alignment::Center)
                .width(Length::Fill),
            )
            .on_press(Message::SelectPlaylist(pid.clone()))
            .interaction(mouse::Interaction::Pointer);

            let card_item = card().content(body_row).footer(
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

        list_col
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
