const stationModel = require("../models/station");

const handleSearchStations = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (query.length < 2) {
            return res.json([]); // Don't search for very short strings
        }
        const stations = await stationModel.searchStationsByName(query);
        res.json(stations);
    } catch (err) {
        res.status(500).json({ error: "Failed to search for stations" });
    }
};

module.exports = {
    handleSearchStations,
};