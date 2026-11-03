pub mod view;

use shadcn_iced::prelude::Mode;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum ViewLayout {
    #[default]
    Grid,
    List,
}

pub struct SettingsState {
    pub api_key: String,
    pub api_key_draft: String,
    pub theme_mode: Mode,
    pub view_layout: ViewLayout,
}

impl SettingsState {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key_draft: api_key.clone(),
            api_key,
            theme_mode: Mode::Dark,
            view_layout: ViewLayout::Grid,
        }
    }

    pub fn toggle_theme(&mut self) {
        self.theme_mode = match self.theme_mode {
            Mode::Dark => Mode::Light,
            Mode::Light => Mode::Dark,
        };
    }

    pub fn save_draft(&mut self) {
        self.api_key = self.api_key_draft.trim().to_string();
    }
}
