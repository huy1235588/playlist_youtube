package com.playlistyoutube.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.playlistyoutube.app.data.local.dao.PlaylistDao
import com.playlistyoutube.app.data.local.entities.ChannelEntity
import com.playlistyoutube.app.data.local.entities.PlaylistEntity
import com.playlistyoutube.app.data.local.entities.PlaylistItemEntity
import com.playlistyoutube.app.data.local.entities.VideoEntity

@Database(
    entities = [
        PlaylistEntity::class,
        ChannelEntity::class,
        VideoEntity::class,
        PlaylistItemEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun playlistDao(): PlaylistDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "playlist_youtube_db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
