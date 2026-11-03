#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod youtube;

use db::Database;
use iced::widget::{Column, center, column, container, row, space, text};
use iced::{Alignment, Element, Length, Task};
use models::{
    Playlist, SortColumn, SortOrder, VideoItemView, format_duration, format_short_date,
    format_view_count,
};
use shadcn_iced::alert::{self, alert};
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
use shadcn_iced::separator::separator;
use shadcn_iced::spinner::spinner;
use shadcn_iced::theme::{self, Accent, Radius};

const PAGE_SIZE: usize = 50;

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
            theme::zinc(state.theme_mode)
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

#[derive(Debug, Clone)]
pub enum ActiveModal {
    None,
    AddPlaylist,
    ApiKeySettings,
    ReplaceVideo {
        playlist_item_id: String,
        old_video_id: String,
    },
    ConfirmDeleteVideo {
        video_id: String,
        video_title: String,
    },
    ConfirmDeletePlaylist {
        playlist_id: String,
        playlist_title: String,
    },
    ConfirmUpdatePlaylist {
        playlist_id: String,
        playlist_title: String,
    },
}

pub struct App {
    db: Database,
    api_key: String,
    api_key_draft: String,
    theme_mode: Mode,

    // Dữ liệu Playlists & Videos
    playlists: Vec<Playlist>,
    selected_playlist: Option<Playlist>,
    videos: Vec<VideoItemView>,
    hidden_count: usize,
    total_videos: usize,

    // Bộ lọc, tìm kiếm & phân trang
    search_query: String,
    sort_column: SortColumn,
    sort_order: SortOrder,
    show_hidden_only: bool,
    current_page: usize,

    // Trạng thái Modal & Tác vụ bất đồng bộ
    modal: ActiveModal,
    add_playlist_input: String,
    replace_video_input: String,
    is_busy: bool,
    status_banner: Option<(String, bool)>, // (thông báo, is_error)
}

#[derive(Debug, Clone)]
pub enum Message {
    // Điều hướng & Giao diện
    ToggleTheme,
    BackToPlaylists,
    SelectPlaylist(String),
    OpenUrl(String),
    DismissBanner,

    // Tìm kiếm, Sắp xếp, Phân trang
    SearchQueryChanged(String),
    ClearSearch,
    SortColumnChanged(SortColumn),
    ToggleSortOrder,
    ToggleHiddenVideos,
    PageChanged(usize),

    // Mở/Đóng Modal
    OpenAddPlaylistModal,
    OpenApiKeyModal,
    OpenReplaceVideoModal {
        playlist_item_id: String,
        old_video_id: String,
    },
    OpenDeleteVideoModal {
        video_id: String,
        video_title: String,
    },
    OpenDeletePlaylistModal {
        playlist_id: String,
        playlist_title: String,
    },
    OpenUpdatePlaylistModal,
    CloseModal,

    // Input trong Modal
    AddPlaylistInputChanged(String),
    ReplaceVideoInputChanged(String),
    ApiKeyDraftChanged(String),
    SaveApiKey,

    // Thực thi hành động (Async / DB)
    SubmitAddPlaylist,
    ConfirmUpdatePlaylist,
    SubmitReplaceVideo,
    ConfirmDeleteVideo,
    ConfirmDeletePlaylist,

    // Kết quả trả về từ Async Task
    PlaylistFetchedResult(Result<(String, usize), String>),
    VideoReplacedResult(Result<String, String>),
}

impl App {
    fn new() -> (Self, Task<Message>) {
        let db = Database::new("playlist_youtube.db").expect("Không thể khởi tạo SQLite Database");
        let api_key = std::env::var("YOUTUBE_API_KEY").unwrap_or_default();
        let playlists = db.get_playlists().unwrap_or_default();

        let app = Self {
            db,
            api_key_draft: api_key.clone(),
            api_key,
            theme_mode: Mode::Dark,
            playlists,
            selected_playlist: None,
            videos: Vec::new(),
            hidden_count: 0,
            total_videos: 0,
            search_query: String::new(),
            sort_column: SortColumn::AddedAt,
            sort_order: SortOrder::Desc,
            show_hidden_only: false,
            current_page: 1,
            modal: ActiveModal::None,
            add_playlist_input: String::new(),
            replace_video_input: String::new(),
            is_busy: false,
            status_banner: None,
        };

        let startup_task = iced::window::oldest().and_then(|id| {
            Task::batch([
                iced::window::minimize(id, false),
                iced::window::maximize(id, true),
                iced::window::gain_focus(id),
            ])
        });

        (app, startup_task)
    }

    fn reload_playlists(&mut self) {
        match self.db.get_playlists() {
            Ok(list) => {
                if let Some(ref current) = self.selected_playlist {
                    self.selected_playlist = list
                        .iter()
                        .find(|p| p.playlist_id == current.playlist_id)
                        .cloned();
                }
                self.playlists = list;
            }
            Err(e) => {
                self.status_banner = Some((format!("Lỗi tải danh sách playlist: {e}"), true));
            }
        }
    }

    fn reload_videos(&mut self) {
        let Some(ref playlist) = self.selected_playlist else {
            self.videos.clear();
            self.total_videos = 0;
            self.hidden_count = 0;
            return;
        };

        let pid = &playlist.playlist_id;
        self.hidden_count = self
            .db
            .get_hidden_videos(pid)
            .map(|v| v.len())
            .unwrap_or(0);

        if self.show_hidden_only {
            match self.db.get_hidden_videos(pid) {
                Ok(list) => {
                    self.total_videos = list.len();
                    self.videos = list;
                }
                Err(e) => {
                    self.status_banner = Some((format!("Lỗi tải video ẩn: {e}"), true));
                }
            }
            return;
        }

        let res = if !self.search_query.trim().is_empty() {
            self.db
                .search_videos(pid, &self.search_query, self.current_page, PAGE_SIZE)
        } else {
            self.db.get_videos_paginated(
                pid,
                self.current_page,
                PAGE_SIZE,
                self.sort_column,
                self.sort_order,
            )
        };

        match res {
            Ok((list, total)) => {
                self.videos = list;
                self.total_videos = total;
            }
            Err(e) => {
                self.status_banner = Some((format!("Lỗi truy vấn video: {e}"), true));
            }
        }
    }

    fn total_pages(&self) -> usize {
        if self.show_hidden_only || self.total_videos == 0 {
            1
        } else {
            self.total_videos.div_ceil(PAGE_SIZE)
        }
    }

    fn update(&mut self, message: Message) -> Task<Message> {
        match message {
            Message::ToggleTheme => {
                self.theme_mode = match self.theme_mode {
                    Mode::Dark => Mode::Light,
                    Mode::Light => Mode::Dark,
                };
            }
            Message::DismissBanner => {
                self.status_banner = None;
            }
            Message::BackToPlaylists => {
                self.selected_playlist = None;
                self.videos.clear();
                self.search_query.clear();
                self.show_hidden_only = false;
                self.current_page = 1;
                self.reload_playlists();
            }
            Message::SelectPlaylist(playlist_id) => {
                if let Some(pl) = self
                    .playlists
                    .iter()
                    .find(|p| p.playlist_id == playlist_id)
                    .cloned()
                {
                    self.selected_playlist = Some(pl);
                    self.current_page = 1;
                    self.search_query.clear();
                    self.show_hidden_only = false;
                    self.reload_videos();
                }
            }
            Message::OpenUrl(url) => {
                let _ = open::that(url);
            }
            Message::SearchQueryChanged(q) => {
                self.search_query = q;
                self.current_page = 1;
                self.show_hidden_only = false;
                self.reload_videos();
            }
            Message::ClearSearch => {
                self.search_query.clear();
                self.current_page = 1;
                self.reload_videos();
            }
            Message::SortColumnChanged(col) => {
                self.sort_column = col;
                self.current_page = 1;
                self.show_hidden_only = false;
                self.reload_videos();
            }
            Message::ToggleSortOrder => {
                self.sort_order = self.sort_order.toggle();
                self.current_page = 1;
                self.reload_videos();
            }
            Message::ToggleHiddenVideos => {
                self.show_hidden_only = !self.show_hidden_only;
                self.current_page = 1;
                self.reload_videos();
            }
            Message::PageChanged(page) => {
                self.current_page = page;
                self.reload_videos();
            }
            Message::OpenAddPlaylistModal => {
                self.add_playlist_input.clear();
                self.modal = ActiveModal::AddPlaylist;
            }
            Message::OpenApiKeyModal => {
                self.api_key_draft = self.api_key.clone();
                self.modal = ActiveModal::ApiKeySettings;
            }
            Message::OpenReplaceVideoModal {
                playlist_item_id,
                old_video_id,
            } => {
                self.replace_video_input.clear();
                self.modal = ActiveModal::ReplaceVideo {
                    playlist_item_id,
                    old_video_id,
                };
            }
            Message::OpenDeleteVideoModal {
                video_id,
                video_title,
            } => {
                self.modal = ActiveModal::ConfirmDeleteVideo {
                    video_id,
                    video_title,
                };
            }
            Message::OpenDeletePlaylistModal {
                playlist_id,
                playlist_title,
            } => {
                self.modal = ActiveModal::ConfirmDeletePlaylist {
                    playlist_id,
                    playlist_title,
                };
            }
            Message::OpenUpdatePlaylistModal => {
                if let Some(ref pl) = self.selected_playlist {
                    self.modal = ActiveModal::ConfirmUpdatePlaylist {
                        playlist_id: pl.playlist_id.clone(),
                        playlist_title: pl
                            .title
                            .clone()
                            .unwrap_or_else(|| pl.playlist_id.clone()),
                    };
                }
            }
            Message::CloseModal => {
                if !self.is_busy {
                    self.modal = ActiveModal::None;
                }
            }
            Message::AddPlaylistInputChanged(val) => {
                self.add_playlist_input = val;
            }
            Message::ReplaceVideoInputChanged(val) => {
                self.replace_video_input = val;
            }
            Message::ApiKeyDraftChanged(val) => {
                self.api_key_draft = val;
            }
            Message::SaveApiKey => {
                self.api_key = self.api_key_draft.trim().to_string();
                self.modal = ActiveModal::None;
                self.status_banner = Some((
                    "Đã cập nhật YouTube API Key cho phiên làm việc.".to_string(),
                    false,
                ));
            }
            Message::SubmitAddPlaylist => {
                if self.is_busy {
                    return Task::none();
                }
                let Some(playlist_id) = youtube::extract_playlist_id(&self.add_playlist_input)
                else {
                    self.status_banner = Some((
                        "URL hoặc ID Playlist không hợp lệ (Cần có '?list=...' hoặc mã Playlist ID)."
                            .to_string(),
                        true,
                    ));
                    return Task::none();
                };

                match self.db.check_existing_playlist(&playlist_id) {
                    Ok(true) => {
                        self.status_banner = Some((
                            format!("Playlist '{playlist_id}' đã tồn tại trong SQLite Database."),
                            true,
                        ));
                        return Task::none();
                    }
                    Err(e) => {
                        self.status_banner = Some((e, true));
                        return Task::none();
                    }
                    Ok(false) => {}
                }

                self.is_busy = true;
                let api_key = self.api_key.clone();
                let db = self.db.clone();

                return Task::perform(
                    async move {
                        let bundle =
                            youtube::fetch_playlist_bundle(&api_key, &playlist_id, None).await?;
                        let count = bundle.items.len();
                        let title = bundle
                            .playlist
                            .title
                            .clone()
                            .unwrap_or_else(|| playlist_id.clone());
                        db.save_playlist_bundle(
                            &bundle.playlist,
                            bundle.playlist_channel.as_ref(),
                            &bundle.channels,
                            &bundle.videos,
                            &bundle.items,
                            false,
                        )?;
                        Ok((title, count))
                    },
                    Message::PlaylistFetchedResult,
                );
            }
            Message::ConfirmUpdatePlaylist => {
                if self.is_busy {
                    return Task::none();
                }
                let ActiveModal::ConfirmUpdatePlaylist { ref playlist_id, .. } = self.modal else {
                    return Task::none();
                };
                let playlist_id = playlist_id.clone();
                let latest_video_id = self.db.get_latest_video_id(&playlist_id).unwrap_or(None);

                self.is_busy = true;
                let api_key = self.api_key.clone();
                let db = self.db.clone();

                return Task::perform(
                    async move {
                        let bundle = youtube::fetch_playlist_bundle(
                            &api_key,
                            &playlist_id,
                            latest_video_id.as_deref(),
                        )
                        .await?;
                        let count = bundle.items.len();
                        let title = bundle
                            .playlist
                            .title
                            .clone()
                            .unwrap_or_else(|| playlist_id.clone());
                        db.save_playlist_bundle(
                            &bundle.playlist,
                            bundle.playlist_channel.as_ref(),
                            &bundle.channels,
                            &bundle.videos,
                            &bundle.items,
                            true,
                        )?;
                        Ok((title, count))
                    },
                    Message::PlaylistFetchedResult,
                );
            }
            Message::PlaylistFetchedResult(res) => {
                self.is_busy = false;
                self.modal = ActiveModal::None;
                match res {
                    Ok((title, count)) => {
                        self.reload_playlists();
                        self.reload_videos();
                        self.status_banner = Some((
                            format!("Đã đồng bộ thành công '{title}' ({count} video mới)."),
                            false,
                        ));
                    }
                    Err(err) => {
                        self.status_banner = Some((err, true));
                    }
                }
            }
            Message::SubmitReplaceVideo => {
                if self.is_busy {
                    return Task::none();
                }
                let ActiveModal::ReplaceVideo {
                    ref playlist_item_id,
                    ..
                } = self.modal
                else {
                    return Task::none();
                };
                let Some(new_video_id) = youtube::extract_video_id(&self.replace_video_input)
                else {
                    self.status_banner = Some((
                        "URL hoặc Video ID không hợp lệ (VD: https://www.youtube.com/watch?v=...)."
                            .to_string(),
                        true,
                    ));
                    return Task::none();
                };

                self.is_busy = true;
                let playlist_item_id = playlist_item_id.clone();
                let api_key = self.api_key.clone();
                let db = self.db.clone();

                return Task::perform(
                    async move {
                        let (video, channel) =
                            youtube::fetch_single_video(&api_key, &new_video_id).await?;
                        let title = video
                            .title
                            .clone()
                            .unwrap_or_else(|| new_video_id.clone());
                        db.replace_video_in_playlist(&playlist_item_id, &video, channel.as_ref())?;
                        Ok(title)
                    },
                    Message::VideoReplacedResult,
                );
            }
            Message::VideoReplacedResult(res) => {
                self.is_busy = false;
                self.modal = ActiveModal::None;
                match res {
                    Ok(title) => {
                        self.reload_videos();
                        self.status_banner = Some((
                            format!("Đã thay thế thành công bằng video '{title}'."),
                            false,
                        ));
                    }
                    Err(e) => {
                        self.status_banner = Some((e, true));
                    }
                }
            }
            Message::ConfirmDeleteVideo => {
                if let ActiveModal::ConfirmDeleteVideo {
                    ref video_id,
                    ref video_title,
                } = self.modal
                {
                    let vid = video_id.clone();
                    let vtitle = video_title.clone();
                    self.modal = ActiveModal::None;
                    match self.db.delete_video(&vid) {
                        Ok(()) => {
                            self.reload_videos();
                            self.status_banner = Some((
                                format!("Đã xóa video '{vtitle}' khỏi SQLite Database."),
                                false,
                            ));
                        }
                        Err(e) => {
                            self.status_banner = Some((e, true));
                        }
                    }
                }
            }
            Message::ConfirmDeletePlaylist => {
                if let ActiveModal::ConfirmDeletePlaylist {
                    ref playlist_id,
                    ref playlist_title,
                } = self.modal
                {
                    let pid = playlist_id.clone();
                    let ptitle = playlist_title.clone();
                    self.modal = ActiveModal::None;
                    match self.db.delete_playlist(&pid) {
                        Ok(()) => {
                            if self
                                .selected_playlist
                                .as_ref()
                                .is_some_and(|p| p.playlist_id == pid)
                            {
                                self.selected_playlist = None;
                            }
                            self.reload_playlists();
                            self.reload_videos();
                            self.status_banner = Some((
                                format!("Đã xóa playlist '{ptitle}' khỏi SQLite Database."),
                                false,
                            ));
                        }
                        Err(e) => {
                            self.status_banner = Some((e, true));
                        }
                    }
                }
            }
        }
        Task::none()
    }

    fn view(&self) -> Element<'_, Message> {
        let top_bar = self.view_top_bar();

        let banner: Element<'_, Message> = if let Some((ref msg, is_error)) = self.status_banner {
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
        };

        let main_body = if self.selected_playlist.is_some() {
            self.view_playlist_videos()
        } else {
            self.view_playlists_dashboard()
        };

        let page_layout = column![top_bar, separator(), banner, main_body]
            .spacing(12)
            .width(Length::Fill)
            .height(Length::Fill);

        let with_modals = self.wrap_modals(page_layout.into());
        tab_order(with_modals).into()
    }

    fn view_top_bar(&self) -> Element<'_, Message> {
        let left_nav: Element<'_, Message> = if let Some(ref pl) = self.selected_playlist {
            let pl_title = pl.title.as_deref().unwrap_or(&pl.playlist_id);
            row![
                button("Danh sách Playlist")
                    .variant(button::Variant::Outline)
                    .icon(lucide::ARROW_LEFT)
                    .on_press(Message::BackToPlaylists),
                text(pl_title).size(18),
                badge(format!("{} videos", self.total_videos)).variant(badge::Variant::Secondary),
            ]
            .spacing(12)
            .align_y(Alignment::Center)
            .into()
        } else {
            row![
                text("YouTube Playlist Manager").size(20),
                badge(format!("{} playlists", self.playlists.len()))
                    .variant(badge::Variant::Secondary),
            ]
            .spacing(12)
            .align_y(Alignment::Center)
            .into()
        };

        let api_status_badge = if self.api_key.is_empty() {
            badge("Chưa có API Key").variant(badge::Variant::Destructive)
        } else {
            badge("API Key Sẵn sàng").variant(badge::Variant::Outline)
        };

        let theme_label = match self.theme_mode {
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

    fn view_playlists_dashboard(&self) -> Element<'_, Message> {
        if self.playlists.is_empty() {
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

        for pl in &self.playlists {
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

            let card_item = card()
                .title(title.clone())
                .description(format!(
                    "Kênh: {channel_name}  •  Ngày tạo: {pub_date}  •  ID: {pid}"
                ))
                .action(
                    badge(format!("{} videos", pl.item_count)).variant(badge::Variant::Secondary),
                )
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

    fn view_playlist_videos(&self) -> Element<'_, Message> {
        let sort_select = select(Some(self.sort_column), Message::SortColumnChanged)
            .placeholder("Sắp xếp theo")
            .label("Tiêu chí sắp xếp")
            .option(SortColumn::AddedAt, SortColumn::AddedAt.label())
            .option(SortColumn::PublishedAt, SortColumn::PublishedAt.label())
            .option(SortColumn::ViewCount, SortColumn::ViewCount.label())
            .option(SortColumn::Duration, SortColumn::Duration.label())
            .option(SortColumn::IndexVideo, SortColumn::IndexVideo.label());

        let order_label = match self.sort_order {
            SortOrder::Desc => "Giảm dần (DESC)",
            SortOrder::Asc => "Tăng dần (ASC)",
        };

        let hidden_btn_variant = if self.show_hidden_only {
            button::Variant::Destructive
        } else {
            button::Variant::Outline
        };

        let mut toolbar = row![
            container(
                input(
                    "Tìm kiếm tên video hoặc Video ID...",
                    &self.search_query
                )
                .icon(lucide::SEARCH)
                .on_input(Message::SearchQueryChanged)
            )
            .width(Length::Fixed(320.0)),
        ]
        .spacing(8)
        .align_y(Alignment::Center);

        if !self.search_query.is_empty() {
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
                button(format!("Video ẩn/lỗi ({})", self.hidden_count))
                    .variant(hidden_btn_variant)
                    .on_press(Message::ToggleHiddenVideos),
            )
            .push(
                button("Cập nhật Playlist")
                    .variant(button::Variant::Secondary)
                    .icon(lucide::REFRESH_CW)
                    .on_press(Message::OpenUpdatePlaylistModal),
            );

        let list_content: Element<'_, Message> = if self.videos.is_empty() {
            center(
                container(
                    empty(if self.show_hidden_only {
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

            for (idx, v) in self.videos.iter().enumerate() {
                let display_order = (self.current_page.saturating_sub(1)) * PAGE_SIZE + idx + 1;
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

        let total_pages = self.total_pages();
        let footer_pagination: Element<'_, Message> = if total_pages > 1 {
            container(
                row![
                    text(format!(
                        "Trang {} / {} (Tổng {} videos)",
                        self.current_page, total_pages, self.total_videos
                    ))
                    .size(13),
                    space::horizontal(),
                    pagination(self.current_page, total_pages, Message::PageChanged),
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

    fn wrap_modals<'a>(&'a self, base: Element<'a, Message>) -> Element<'a, Message> {
        match self.modal {
            ActiveModal::None => base,

            ActiveModal::AddPlaylist => {
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
                            &self.add_playlist_input,
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

            ActiveModal::ApiKeySettings => dialog(base, true)
                .title("Cấu hình YouTube Data API v3 Key")
                .description(
                    "Ứng dụng tự động đọc biến YOUTUBE_API_KEY từ file .env. Bạn cũng có thể nhập hoặc đổi trực tiếp tại đây.",
                )
                .width(460.0)
                .on_close(Message::CloseModal)
                .content(
                    input("AIzaSy...", &self.api_key_draft)
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
                .into(),

            ActiveModal::ReplaceVideo {
                ref old_video_id, ..
            } => {
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
                            &self.replace_video_input,
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

            ActiveModal::ConfirmDeleteVideo {
                ref video_id,
                ref video_title,
            } => alert_dialog(base, true)
                .title("Xóa Video khỏi Database?")
                .description(format!(
                    "Bạn có chắc chắn muốn xóa video \"{video_title}\" (ID: {video_id}) khỏi SQLite không?"
                ))
                .cancel("Hủy", Message::CloseModal)
                .destructive_action("Xóa Video", Message::ConfirmDeleteVideo)
                .into(),

            ActiveModal::ConfirmDeletePlaylist {
                ref playlist_title, ..
            } => alert_dialog(base, true)
                .title("Xóa toàn bộ Playlist?")
                .description(format!(
                    "Bạn có chắc chắn muốn xóa playlist \"{playlist_title}\" và danh sách video liên kết khỏi SQLite không?"
                ))
                .cancel("Hủy", Message::CloseModal)
                .destructive_action("Xóa Playlist", Message::ConfirmDeletePlaylist)
                .into(),

            ActiveModal::ConfirmUpdatePlaylist {
                ref playlist_title, ..
            } => alert_dialog(base, true)
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
                .into(),
        }
    }
}
