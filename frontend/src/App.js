import React, { useEffect, useState } from 'react';
import axios from 'axios'

import './App.css';
import ErrorPage from './component/ErrorPage';
import LoaderPage from './component/LoaderPage';
import InputForm from './component/input/InputForm';

function App() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [titleVideo, setTitleVideo] = useState('');
    const [channelVideo, setChannelVideo] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [urlVideo, setUrlVideo] = useState('');
    const [urlChannel, setUrlChannel] = useState('');

    const contentNotFound = channelVideo === "Not Found" ? "content-not-found" : "";

    // Lấy content
    const fetchData = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            // Gọi API backend
            const response = await axios.get("/api/content", {
                params: { input }
            }); // URL

            const fetch = await response.data;

            setTitleVideo(fetch.data.titleVideo || "Not Found");
            setChannelVideo(fetch.data.channelVideo || "Not Found");
            setImageUrl(fetch.data.imageUrl || "Not Found")
            setUrlVideo(fetch.data.urlVideo || "Not Found");
            setUrlChannel(fetch.data.urlChannel || "Not Found");

        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="container">
                <LoaderPage />
            </main>
        )
    }

    if (error) {
        return (
            <main className="container">
                <ErrorPage
                    errorMessage={error.message}
                />
            </main>
        )
    }

    return (
        <div className="App">
            <header className="App-header">
                <InputForm
                    type='text'
                    input={input}
                    setInput={setInput}
                    onSubmit={fetchData}
                />

                {/* Hiển thị tên tiêu đề video */}
                <p className='content'>
                    Title of video is:
                    <span className={`a-content ${contentNotFound}`}>
                        {titleVideo}
                    </span>
                </p>

                {/* Hiển thị kênh channel */}
                <p className='content'>
                    Channel of video is:
                    <span className={`a-content ${contentNotFound}`}>
                        {channelVideo}
                    </span>
                </p>

                {/* Hiển thị link hình ảnh */}
                <p className='content'>
                    <span className='span-content'>
                        Link of image video is:
                    </span>
                    <a className={`a-content ${contentNotFound}`}
                        href={imageUrl}
                    >
                        {imageUrl}
                    </a>
                </p>

                {/* Hiển thị link video */}
                <p className='content'>
                    <span className='span-content'>
                        Link of video is:
                    </span>
                    <a className={`a-content`}
                        href={`https://www.youtube.com/${urlVideo}`}
                    >
                        {`https://www.youtube.com/${urlVideo}`}
                    </a>
                </p>

                {/* Hiển thị link channel */}
                <p className='content'>
                    <span className='span-content'>
                        Link Channel of video is:
                    </span>
                    {
                        channelVideo !== "Not Found"
                            ? (
                                <a className={`a-content ${contentNotFound}`}
                                    href={`https://www.youtube.com/${urlChannel}`}
                                >
                                    {`https://www.youtube.com/${urlChannel}`}
                                </a>
                            )
                            : (
                                <span className={`${contentNotFound}`}>
                                    {channelVideo}
                                </span>
                            )
                    }
                </p>

                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div >
    );
}

export default App;
