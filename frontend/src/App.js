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

    // Lấy content
    const fetchData = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            // Gọi API backend
            const response = await axios.get("/api/videos/fetch", {
                params: { input }
            }); // URL

            const fetch = await response.data;


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
                {/* Đầu vào  */}
                <InputForm
                    placeholder="Enter PlaylistID..."
                    type='text'
                    input={input}
                    setInput={setInput}
                    onSubmit={fetchData}
                />

                {/* HEHE */}
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
