const routeModel = require('../models/route');

const getAllRoutes = async (req, res) => {
    try {
        const routes = await routeModel.getAllRoutes();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRouteById = async (req, res) => {
    try {
        const { id } = req.params;
        const route = await routeModel.getRouteById(id);
        
        if (!route) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }
        
        res.json(route);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createRoute = async (req, res) => {
    try {
        const { source_station_id, destination_station_id, distance, duration } = req.body;
        
        if (!source_station_id || !destination_station_id || !distance || !duration) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }
        
        const route = await routeModel.createRoute({
            source_station_id, destination_station_id, distance, duration
        });
        
        res.status(201).json({ success: true, route });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const { source_station_id, destination_station_id, distance, duration } = req.body;
        
        if (!source_station_id || !destination_station_id || !distance || !duration) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }
        
        const route = await routeModel.updateRoute(id, {
            source_station_id, destination_station_id, distance, duration
        });
        
        if (!route) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }
        
        res.json({ success: true, route });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const route = await routeModel.deleteRoute(id);
        
        if (!route) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }
        
        res.json({ success: true, message: "Route deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRouteStations = async (req, res) => {
    try {
        const { routeId } = req.params;
        const stations = await routeModel.getRouteStations(routeId);
        res.json(stations);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addStationToRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { station_id, arrival_time, departure_time } = req.body;
        
        if (!station_id) {
            return res.status(400).json({ success: false, message: "Station ID is required" });
        }
        
        const routeStation = await routeModel.addStationToRoute(routeId, station_id, arrival_time, departure_time);
        
        res.status(201).json({ success: true, routeStation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeStationFromRoute = async (req, res) => {
    try {
        const { routeStationId } = req.params;
        const routeStation = await routeModel.removeStationFromRoute(routeStationId);
        
        if (!routeStation) {
            return res.status(404).json({ success: false, message: "Route station not found" });
        }
        
        res.json({ success: true, message: "Station removed from route successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    getRouteStations,
    addStationToRoute,
    removeStationFromRoute
}; 