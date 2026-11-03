pub mod view;

use shadcn_iced::prelude::Mode;

pub struct SettingsState {
    pub api_key: String,
    pub api_key_draft: String,
    pub theme_mode: Mode,
}

impl SettingsState {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key_draft: api_key.clone(),
            api_key,
            theme_mode: Mode::Dark,
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
