use crate::app::{App, Message};
use crate::core::utils::{format_duration, format_short_date, format_view_count};
use crate::features::videos::PAGE_SIZE;
use crate::features::videos::model::{SortColumn, SortOrder};
use iced::widget::{Column, center, column, container, row, space, text};
use iced::{Alignment, Element, Length};
use shadcn_iced::alert_dialog::alert_dialog;
use shadcn_iced::badge::{self, badge};
use shadcn_iced::button::{self, button};
use shadcn_iced::card::card;
use shadcn_iced::dialog::dialog;
use shadcn_iced::empty::empty;
use shadcn_iced::input::input;
use shadcn_iced::pagination::pagination;
use shadcn_iced::prelude::*;
use shadcn_iced::scroll_area::scroll_area;
use shadcn_iced::select::select;
use shadcn_iced::spinner::spinner;

impl App {
    pub fn view_playlist_videos(&self) -> Element<'_, Message> {
        let vstate = &self.videos_state;

        let sort_select = select(Some(vstate.sort_column), Message::SortColumnChanged)
            .placeholder("Sắp xếp theo")
            .label("Tiêu chí sắp xếp")
            .option(SortColumn::AddedAt, SortColumn::AddedAt.label())
            .option(SortColumn::PublishedAt, SortColumn::PublishedAt.label())
            .option(SortColumn::ViewCount, SortColumn::ViewCount.label())
            .option(SortColumn::Duration, SortColumn::Duration.label())
            .option(SortColumn::IndexVideo, SortColumn::IndexVideo.label());

        let order_label = match vstate.sort_order {
            SortOrder::Desc => "Giảm dần (DESC)",
            SortOrder::Asc => "Tăng dần (ASC)",
        };

        let hidden_btn_variant = if vstate.show_hidden_only {
            button::Variant::Destructive
        } else {
            button::Variant::Outline
        };

        let mut toolbar = row![
            container(
                input(
                    "Tìm kiếm tên video hoặc Video ID...",
                    &vstate.search_query
                )
                .icon(lucide::SEARCH)
                .on_input(Message::SearchQueryChanged)
            )
            .width(Length::Fixed(320.0)),
        ]
        .spacing(8)
        .align_y(Alignment::Center);

        if !vstate.search_query.is_empty() {
            toolbar = toolbar.push(
                button("Xóa lọc")
                    .size(button::Size::Sm)
                    .variant(button::Variant::Ghost)
                    .on_press(Message::ClearSearch),
            );
        }

        toolbar = toolbar
            .push(space::horizontal())
            .push(sort_select)
            .push(
                button(order_label)
                    .variant(button::Variant::Outline)
                    .on_press(Message::ToggleSortOrder),
            )
            .push(
                button(format!("Video ẩn/lỗi ({})", vstate.hidden_count))
                    .variant(hidden_btn_variant)
                    .on_press(Message::ToggleHiddenVideos),
            )
            .push(
                button("Cập nhật Playlist")
                    .variant(button::Variant::Secondary)
                    .icon(lucide::REFRESH_CW)
                    .on_press(Message::OpenUpdatePlaylistModal),
            );

        let list_content: Element<'_, Message> = if vstate.videos.is_empty() {
            center(
                container(
                    empty(if vstate.show_hidden_only {
                        "Không có video bị ẩn hoặc xóa"
                    } else {
                        "Không tìm thấy video phù hợp"
                    })
                    .description("Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc hiển thị.")
                    .bordered(true),
                )
                .max_width(460),
            )
            .padding(24)
            .into()
        } else {
            let mut rows_col = Column::new().spacing(10).width(Length::Fill);

            for (idx, v) in vstate.videos.iter().enumerate() {
                let display_order = (vstate.current_page.saturating_sub(1)) * PAGE_SIZE + idx + 1;
                let is_deleted = v.is_hidden_or_deleted();

                let title_str = v
                    .video_title
                    .clone()
                    .unwrap_or_else(|| format!("[Video bị ẩn / đã xóa] ({})", v.video_id));

                let channel_str = v
                    .channel_title
                    .as_deref()
                    .filter(|s| !s.is_empty())
                    .unwrap_or("Không rõ kênh");

                let duration_badge = if is_deleted {
                    badge("Đã ẩn / Xóa").variant(badge::Variant::Destructive)
                } else {
                    badge(format_duration(v.duration.as_deref())).variant(badge::Variant::Secondary)
                };

                let meta_text = if is_deleted {
                    format!(
                        "#{} (Index gốc: {})  •  Video ID: {}  •  Ngày thêm: {}",
                        display_order,
                        v.index_video,
                        v.video_id,
                        format_short_date(Some(&v.added_at))
                    )
                } else {
                    format!(
                        "#{} (Index: {})  •  Kênh: {}  •  {} lượt xem  •  Đăng: {}  •  Thêm vào PL: {}",
                        display_order,
                        v.index_video,
                        channel_str,
                        format_view_count(v.view_count),
                        format_short_date(v.published_at.as_deref()),
                        format_short_date(Some(&v.added_at))
                    )
                };

                let watch_url = format!("https://www.youtube.com/watch?v={}", v.video_id);

                let actions_row = row![
                    duration_badge,
                    button("Mở YouTube")
                        .size(button::Size::Sm)
                        .variant(button::Variant::Outline)
                        .icon(lucide::EXTERNAL_LINK)
                        .on_press(Message::OpenUrl(watch_url)),
                    button("Thay thế")
                        .size(button::Size::Sm)
                        .variant(button::Variant::Secondary)
                        .on_press(Message::OpenReplaceVideoModal {
                            playlist_item_id: v.playlist_item_id.clone(),
                            old_video_id: v.video_id.clone(),
                        }),
                    button("Xóa")
                        .size(button::Size::Sm)
                        .variant(button::Variant::Destructive)
                        .icon(lucide::TRASH_2)
                        .on_press(Message::OpenDeleteVideoModal {
                            video_id: v.video_id.clone(),
                            video_title: title_str.clone(),
                        }),
                ]
                .spacing(6)
                .align_y(Alignment::Center);

                let video_card = card()
                    .size(shadcn_iced::card::Size::Sm)
                    .title(title_str)
                    .description(meta_text)
                    .action(actions_row);

                rows_col = rows_col.push(video_card);
            }

            scroll_area(container(rows_col).padding([4, 24]))
                .width(Length::Fill)
                .height(Length::Fill)
                .into()
        };

        let total_pages = vstate.total_pages();
        let footer_pagination: Element<'_, Message> = if total_pages > 1 {
            container(
                row![
                    text(format!(
                        "Trang {} / {} (Tổng {} videos)",
                        vstate.current_page, total_pages, vstate.total_videos
                    ))
                    .size(13),
                    space::horizontal(),
                    pagination(vstate.current_page, total_pages, Message::PageChanged),
                ]
                .align_y(Alignment::Center)
                .width(Length::Fill),
            )
            .padding([8, 24])
            .into()
        } else {
            Column::new().into()
        };

        column![
            container(toolbar).padding([4, 24]),
            list_content,
            footer_pagination
        ]
        .spacing(10)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
    }

    pub fn view_replace_video_modal<'a>(
        &'a self,
        base: Element<'a, Message>,
        old_video_id: &str,
    ) -> Element<'a, Message> {
        let mut d = dialog(base, true)
            .title(format!("Thay thế Video ({old_video_id})"))
            .description(
                "Nhập URL hoặc ID của video YouTube mới để thay thế vào vị trí này trong Playlist.",
            )
            .width(460.0)
            .on_close(Message::CloseModal)
            .content(
                input(
                    "https://www.youtube.com/watch?v=...",
                    &self.videos_state.replace_video_input,
                )
                .on_input(Message::ReplaceVideoInputChanged)
                .on_submit(Message::SubmitReplaceVideo),
            );

        if self.is_busy {
            d = d.content(
                row![
                    spinner(),
                    text("Đang lấy thông tin video từ YouTube API...").size(13)
                ]
                .spacing(8)
                .align_y(Alignment::Center),
            );
        }

        d.footer_buttons(|fill| {
            let cancel_btn = button("Hủy")
                .variant(button::Variant::Outline)
                .on_press(Message::CloseModal);
            let submit_btn = button("Xác nhận thay thế")
                .on_press_maybe((!self.is_busy).then_some(Message::SubmitReplaceVideo));
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

    pub fn view_confirm_delete_video_modal<'a>(
        &'a self,
        base: Element<'a, Message>,
        video_id: &str,
        video_title: &str,
    ) -> Element<'a, Message> {
        alert_dialog(base, true)
            .title("Xóa Video khỏi Database?")
            .description(format!(
                "Bạn có chắc chắn muốn xóa video \"{video_title}\" (ID: {video_id}) khỏi SQLite không?"
            ))
            .cancel("Hủy", Message::CloseModal)
            .destructive_action("Xóa Video", Message::ConfirmDeleteVideo)
            .into()
    }
}
