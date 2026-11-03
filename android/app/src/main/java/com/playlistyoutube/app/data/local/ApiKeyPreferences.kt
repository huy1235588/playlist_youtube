package com.playlistyoutube.app.data.local

import android.content.Context
import com.playlistyoutube.app.BuildConfig

class ApiKeyPreferences(context: Context) {

    private val prefs = context.applicationContext.getSharedPreferences(
        "youtube_api_prefs",
        Context.MODE_PRIVATE
    )

    fun getApiKey(): String {
        val customKey = prefs.getString(KEY_YOUTUBE_API, null)?.trim()
        return if (!customKey.isNullOrEmpty()) {
            customKey
        } else {
            BuildConfig.DEFAULT_YOUTUBE_API_KEY
        }
    }

    fun setApiKey(apiKey: String) {
        prefs.edit().putString(KEY_YOUTUBE_API, apiKey.trim()).apply()
    }

    fun resetToDefault() {
        prefs.edit().remove(KEY_YOUTUBE_API).apply()
    }

    companion object {
        private const val KEY_YOUTUBE_API = "youtube_api_key"

        val PRESET_KEYS = listOf(
            "Key 1 (Default - vt)" to "AIzaSyCU2kNh0i8S27mtdzaLg1rLdPWIC7Olqhk",
            "Key 2 (hh)" to "AIzaSyA_H3hEjE8rwNjG21RK-gbr2-Q9yBgJ-v8",
            "Key 3 (nh)" to "AIzaSyAycAK6moRvmXedsWAm8RsS5FTlpo8hfAc"
        )
    }
}
