use crate::core::db::Database;
use crate::core::utils::{extract_playlist_id, extract_video_id};
use crate::features::playlists::PlaylistsState;
use crate::features::playlists::api::fetch_playlist_bundle;
use crate::features::settings::SettingsState;
use crate::features::videos::VideosState;
use crate::features::videos::api::fetch_single_video;
use crate::features::videos::model::SortColumn;
use iced::widget::column;
use iced::{Element, Length, Task};
use shadcn_iced::prelude::*;
use shadcn_iced::separator::separator;

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
    pub db: Database,
    pub settings_state: SettingsState,
    pub playlists_state: PlaylistsState,
    pub videos_state: VideosState,

    // Trạng thái Modal & Tác vụ bất đồng bộ
    pub modal: ActiveModal,
    pub is_busy: bool,
    pub status_banner: Option<(String, bool)>, // (thông báo, is_error)
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
    pub fn new() -> (Self, Task<Message>) {
        let db = Database::new("playlist_youtube.db").expect("Không thể khởi tạo SQLite Database");
        let api_key = std::env::var("YOUTUBE_API_KEY").unwrap_or_default();
        let playlists = db.get_playlists().unwrap_or_default();

        let app = Self {
            db,
            settings_state: SettingsState::new(api_key),
            playlists_state: PlaylistsState::new(playlists),
            videos_state: VideosState::new(),
            modal: ActiveModal::None,
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

    pub fn reload_playlists(&mut self) {
        if let Err(e) = self.playlists_state.reload(&self.db) {
            self.status_banner = Some((format!("Lỗi tải danh sách playlist: {e}"), true));
        }
    }

    pub fn reload_videos(&mut self) {
        let pid = self
            .playlists_state
            .selected_playlist
            .as_ref()
            .map(|p| p.playlist_id.as_str());
        if let Err(e) = self.videos_state.reload(&self.db, pid) {
            self.status_banner = Some((format!("Lỗi truy vấn video: {e}"), true));
        }
    }

    pub fn update(&mut self, message: Message) -> Task<Message> {
        match message {
            Message::ToggleTheme => {
                self.settings_state.toggle_theme();
            }
            Message::DismissBanner => {
                self.status_banner = None;
            }
            Message::BackToPlaylists => {
                self.playlists_state.selected_playlist = None;
                self.videos_state.clear();
                self.reload_playlists();
            }
            Message::SelectPlaylist(playlist_id) => {
                if let Some(pl) = self
                    .playlists_state
                    .playlists
                    .iter()
                    .find(|p| p.playlist_id == playlist_id)
                    .cloned()
                {
                    self.playlists_state.selected_playlist = Some(pl);
                    self.videos_state.reset_for_playlist();
                    self.reload_videos();
                }
            }
            Message::OpenUrl(url) => {
                let _ = open::that(url);
            }
            Message::SearchQueryChanged(q) => {
                self.videos_state.search_query = q;
                self.videos_state.current_page = 1;
                self.videos_state.show_hidden_only = false;
                self.reload_videos();
            }
            Message::ClearSearch => {
                self.videos_state.search_query.clear();
                self.videos_state.current_page = 1;
                self.reload_videos();
            }
            Message::SortColumnChanged(col) => {
                self.videos_state.sort_column = col;
                self.videos_state.current_page = 1;
                self.videos_state.show_hidden_only = false;
                self.reload_videos();
            }
            Message::ToggleSortOrder => {
                self.videos_state.sort_order = self.videos_state.sort_order.toggle();
                self.videos_state.current_page = 1;
                self.reload_videos();
            }
            Message::ToggleHiddenVideos => {
                self.videos_state.show_hidden_only = !self.videos_state.show_hidden_only;
                self.videos_state.current_page = 1;
                self.reload_videos();
            }
            Message::PageChanged(page) => {
                self.videos_state.current_page = page;
                self.reload_videos();
            }
            Message::OpenAddPlaylistModal => {
                self.playlists_state.add_playlist_input.clear();
                self.modal = ActiveModal::AddPlaylist;
            }
            Message::OpenApiKeyModal => {
                self.settings_state.api_key_draft = self.settings_state.api_key.clone();
                self.modal = ActiveModal::ApiKeySettings;
            }
            Message::OpenReplaceVideoModal {
                playlist_item_id,
                old_video_id,
            } => {
                self.videos_state.replace_video_input.clear();
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
                if let Some(ref pl) = self.playlists_state.selected_playlist {
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
                self.playlists_state.add_playlist_input = val;
            }
            Message::ReplaceVideoInputChanged(val) => {
                self.videos_state.replace_video_input = val;
            }
            Message::ApiKeyDraftChanged(val) => {
                self.settings_state.api_key_draft = val;
            }
            Message::SaveApiKey => {
                self.settings_state.save_draft();
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
                let Some(playlist_id) =
                    extract_playlist_id(&self.playlists_state.add_playlist_input)
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
                let api_key = self.settings_state.api_key.clone();
                let db = self.db.clone();

                return Task::perform(
                    async move {
                        let bundle = fetch_playlist_bundle(&api_key, &playlist_id, None).await?;
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
                let api_key = self.settings_state.api_key.clone();
                let db = self.db.clone();

                return Task::perform(
                    async move {
                        let bundle = fetch_playlist_bundle(
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
                let Some(new_video_id) = extract_video_id(&self.videos_state.replace_video_input)
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
                let api_key = self.settings_state.api_key.clone();
                let db = self.db.clone();

                return Task::perform(
                    async move {
                        let (video, channel) =
                            fetch_single_video(&api_key, &new_video_id).await?;
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
                                .playlists_state
                                .selected_playlist
                                .as_ref()
                                .is_some_and(|p| p.playlist_id == pid)
                            {
                                self.playlists_state.selected_playlist = None;
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

    pub fn view(&self) -> Element<'_, Message> {
        let top_bar = self.view_top_bar();
        let banner = self.view_status_banner();

        let main_body = if self.playlists_state.selected_playlist.is_some() {
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

    fn wrap_modals<'a>(&'a self, base: Element<'a, Message>) -> Element<'a, Message> {
        match self.modal {
            ActiveModal::None => base,
            ActiveModal::AddPlaylist => self.view_add_playlist_modal(base),
            ActiveModal::ApiKeySettings => self.view_api_key_modal(base),
            ActiveModal::ReplaceVideo {
                ref old_video_id, ..
            } => self.view_replace_video_modal(base, old_video_id),
            ActiveModal::ConfirmDeleteVideo {
                ref video_id,
                ref video_title,
            } => self.view_confirm_delete_video_modal(base, video_id, video_title),
            ActiveModal::ConfirmDeletePlaylist {
                ref playlist_title, ..
            } => self.view_confirm_delete_playlist_modal(base, playlist_title),
            ActiveModal::ConfirmUpdatePlaylist {
                ref playlist_title, ..
            } => self.view_confirm_update_playlist_modal(base, playlist_title),
        }
    }
}
