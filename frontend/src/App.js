import React, { useEffect, useState } from 'react';
import axios from 'axios'

import './App.css';
import ErrorPage from './component/ErrorPage';
import LoaderPage from './component/LoaderPage';
import InputForm from './component/input/InputForm'

function App() {
    const [input, setInput] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (event) => {
        event.preventDefault();
        setContent("");
        setLoading(true);
        try {
            // Gọi API backend
            const response = await axios.get('http://192.168.1.13:3001/api/data', {
                params: { input }
            }); // URL

            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }

            const data = await response.data;

            setContent(data.titleVideoContent || "Not found");

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

                <p>
                    Title of video is: {content}
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
