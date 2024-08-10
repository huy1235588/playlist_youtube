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

            setTitleVideo(fetch.data.titleVideo || "Not found");
            setChannelVideo(fetch.data.channelVideo || "Not found");
            setImageUrl(fetch.data.imageUrl || "Not found")
            setUrlVideo(fetch.data.urlVideo || "Not found");
            setUrlChannel(fetch.data.urlChannel || "Not found");

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
                    Title of video is: {titleVideo}
                </p>

                {/* Hiển thị kênh channel */}
                <p className='content'>
                    Channel of video is: {channelVideo}
                </p>

                {/* Hiển thị link hình ảnh */}
                <p className='content'>
                    <span className='span-content'>
                        Link of image video is:
                    </span>
                    <a className='a-content'
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
                    <a className='a-content'
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
                    <a className='a-content'
                        href={`https://www.youtube.com/${urlChannel}`}
                    >
                        {`https://www.youtube.com/${urlChannel}`}
                    </a>
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
        </div>
    );
}

export default App;
