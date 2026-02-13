import React, { useState, useEffect } from 'react';
import './Search.css';
import SideBar from "./SideBar";

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allData, setAllData] = useState([]); // Stores all data from XML

    // 1. Fetch and Parse XML when the page loads
    useEffect(() => {
        fetch('/vconnect_data.xml')
            .then(response => response.text())
            .then(str => {
                // Parse the XML string
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(str, "text/xml");
                
                // Extract all <item> tags
                const items = Array.from(xmlDoc.getElementsByTagName("item"));
                
                // Convert XML nodes to a JavaScript array
                const parsedData = items.map(item => ({
                    type: item.getAttribute("type"), // Read <item type="...">
                    name: item.getElementsByTagName("name")[0].textContent,
                    description: item.getElementsByTagName("description")[0].textContent,
                    category: item.getElementsByTagName("category")[0].textContent
                }));

                setAllData(parsedData);
            })
            .catch(err => console.error("Error reading XML:", err));
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        
        if (!query) {
            setResults([]);
            return;
        }

        // 2. Filter the data based on the search query
        const filtered = allData.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) || 
            item.category.toLowerCase().includes(query.toLowerCase())
        );

        setResults(filtered);
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
                        placeholder="Search events, clubs, or categories..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="searchButton">Search</button>
                </form>

                <p className="searchHelp">
                    Try searching for "Robotics", "Arts", or "Hackathon".
                </p>

                <div className="searchResults">
                    {results.length === 0 ? (
                        <div className="noResults">
                            {query ? "No results found" : "Enter a keyword to search"}
                        </div>
                    ) : (
                        results.map((item, index) => (
                            <div key={index} className="resultItem">
                                {/* Displaying the data cleanly */}
                                <div style={{fontWeight: 'bold', fontSize: '1.1em'}}>
                                    {item.name} 
                                    <span style={{
                                        fontSize: '0.8em', 
                                        backgroundColor: '#e0e0e0', 
                                        padding: '2px 8px', 
                                        borderRadius: '10px', 
                                        marginLeft: '10px',
                                        color: '#555'
                                    }}>
                                        {item.type}
                                    </span>
                                </div>
                                <div style={{color: '#666', marginTop: '4px'}}>{item.description}</div>
                                <div style={{fontSize: '0.9em', color: '#888', marginTop: '4px'}}>
                                    Category: {item.category}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}