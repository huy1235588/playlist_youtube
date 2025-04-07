import PlaylistYoutube from "@/components/home/playlists/playlistYoutube";
import "./home.css?v=1.0.0";

const CSS_CLASS = "home-page"; // Định nghĩa class CSS cho trang home

export default function Home() {
    return (
        <main className={`main ${CSS_CLASS}`}>
            <PlaylistYoutube />
        </main>
    );
}
