pub mod api;
pub mod model;
pub mod repo;
pub mod view;

use crate::core::db::Database;
use crate::features::playlists::model::Playlist;

pub struct PlaylistsState {
    pub playlists: Vec<Playlist>,
    pub selected_playlist: Option<Playlist>,
    pub add_playlist_input: String,
}

impl PlaylistsState {
    pub fn new(playlists: Vec<Playlist>) -> Self {
        Self {
            playlists,
            selected_playlist: None,
            add_playlist_input: String::new(),
        }
    }

    pub fn reload(&mut self, db: &Database) -> Result<(), String> {
        let list = db.get_playlists()?;
        if let Some(ref current) = self.selected_playlist {
            self.selected_playlist = list
                .iter()
                .find(|p| p.playlist_id == current.playlist_id)
                .cloned();
        }
        self.playlists = list;
        Ok(())
    }
}
