import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const CityContext = createContext();

export const CityProvider = ({ children }) => {
    const [selectedCity, setSelectedCity] = useState("Chennai");
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await axios.get('/api/movies/locations');
                setCities(res.data);
            } catch (err) {
                console.error('Error fetching cities:', err);
                setCities([]);
            }
        };
        fetchCities();
    }, []);

    return (
        <CityContext.Provider value={{ selectedCity, setSelectedCity, cities }}>
            {children}
        </CityContext.Provider>
    );
};

export default CityContext;
