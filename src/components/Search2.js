import React, { useState } from 'react';
import './Search.css';
import SideBar from "./SideBar";

// ...existing code...
export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const onSubmit = (e) => {
        e.preventDefault();
        // temporary demo search - replace with real search logic / API call
        setResults(query ? [`Result for "${query}"`] : []);
    };

    const clear = () => {
        setQuery('');
        setResults([]);
    };

    return (
        <>
            <SideBar />
            <div className="searchContainer">
                <h2>Search Page</h2>

                <form className="searchBar" onSubmit={onSubmit}>
                    <input
                        type="search"
                        className="searchInput"
                        placeholder="Search events, clubs, people..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                    />
                
                    <button type="submit" className="searchButton">Search</button>
                </form>

                <p className="searchHelp">This is where users can search for events and clubs. Trending clubs and events. My clubs and events</p>

                <div className="searchResults">
                    {results.length === 0 ? (
                        <div className="noResults">No results</div>
                    ) : (
                        results.map((r, i) => (
                            <div key={i} className="resultItem">{r}</div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}