// controllers/WaterMapController.js
import WaterSource from "../models/WaterSource.js";
import WaterReport from "../models/WaterReport.js";
import WaterAlert from "../models/WaterAlert.js";
import axios from "axios";

class WaterController {
  
  // Get all water sources with optional filters
  async getWaterSources(req, res) {
    try {
      const { 
        type, 
        minPurity, 
        maxSeverity, 
        lat, 
        lng, 
        radius = 50000 // 50km default
      } = req.query;

      let query = {};

      // Filter by type
      if (type) {
        query.type = type;
      }

      // Filter by purity score
      if (minPurity) {
        query["qualityMetrics.purityScore"] = { $gte: parseFloat(minPurity) };
      }

      // Filter by severity
      if (maxSeverity) {
        query["qualityMetrics.severityScore"] = { $lte: parseFloat(maxSeverity) };
      }

      // Geospatial query - find sources within radius
      if (lat && lng) {
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(radius) // in meters
          }
        };
      }

      const waterSources = await WaterSource.find(query)
        .sort({ "qualityMetrics.purityScore": -1 })
        .limit(100);

      res.status(200).json({
        success: true,
        count: waterSources.length,
        data: waterSources
      });
    } catch (error) {
      console.error("Error fetching water sources:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching water sources",
        error: error.message
      });
    }
  }

  // Find nearest clean water source
  async findNearestCleanSource(req, res) {
    try {
      const { lat, lng, minPurity = 70 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required"
        });
      }

      const nearestSource = await WaterSource.findOne({
        "qualityMetrics.purityScore": { $gte: parseFloat(minPurity) },
        isSafeForUse: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            }
          }
        }
      });

      if (!nearestSource) {
        return res.status(404).json({
          success: false,
          message: "No clean water source found nearby"
        });
      }

      // Calculate distance
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        nearestSource.location.coordinates[1],
        nearestSource.location.coordinates[0]
      );

      res.status(200).json({
        success: true,
        data: {
          ...nearestSource.toObject(),
          distance: Math.round(distance * 100) / 100 // Round to 2 decimals
        }
      });
    } catch (error) {
      console.error("Error finding nearest clean source:", error);
      res.status(500).json({
        success: false,
        message: "Error finding nearest clean source",
        error: error.message
      });
    }
  }

  // Submit user report
  async submitReport(req, res) {
    try {
      const {
        reportType,
        location,
        observations,
        description,
        waterSourceId
      } = req.body;

      const userId = req.user._id; // Assuming authentication middleware

      // Validate required fields
      if (!reportType || !location || !description) {
        return res.status(400).json({
          success: false,
          message: "Report type, location, and description are required"
        });
      }

      // Create new report
      const report = await WaterReport.create({
        userId,
        waterSourceId: waterSourceId || null,
        reportType,
        location,
        observations,
        description,
      });

      // If it's a new source report, create the water source
      if (reportType === "new_source") {
        const newSource = await WaterSource.create({
          name: `User Reported - ${new Date().toISOString().split('T')[0]}`,
          type: observations.waterType || "stream",
          location,
          qualityMetrics: {
            purityScore: observations.estimatedPurity || 50,
            pollutionLevel: observations.visiblePollution ? "high" : "moderate",
            severityScore: observations.visiblePollution ? 7 : 4,
          },
          dataSource: "user_reported",
          isVerified: false,
        });

        // Update report with waterSourceId
        report.waterSourceId = newSource._id;
        await report.save();

        return res.status(201).json({
          success: true,
          message: "Report submitted and new water source created",
          data: { report, waterSource: newSource }
        });
      }

      // If updating existing source
      if (waterSourceId) {
        const waterSource = await WaterSource.findById(waterSourceId);
        if (waterSource) {
          waterSource.reportsCount += 1;
          waterSource.lastUpdated = new Date();
          
          // Update metrics based on user observations
          if (observations.estimatedPurity) {
            waterSource.qualityMetrics.purityScore = 
              (waterSource.qualityMetrics.purityScore * waterSource.reportsCount + 
               observations.estimatedPurity) / (waterSource.reportsCount + 1);
          }
          
          await waterSource.save();
        }
      }

      res.status(201).json({
        success: true,
        message: "Report submitted successfully",
        data: report
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      res.status(500).json({
        success: false,
        message: "Error submitting report",
        error: error.message
      });
    }
  }

  // Fetch data from Water Quality Portal API
  async fetchWaterQualityData(req, res) {
    try {
      const { lat, lng, radius = 50 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required"
        });
      }

      // Water Quality Portal API endpoint
      const apiUrl = `https://www.waterqualitydata.us/data/Result/search`;
      
      const params = {
        lat: parseFloat(lat),
        long: parseFloat(lng),
        within: parseFloat(radius), // miles
        mimeType: "json",
        zip: "no"
      };

      const response = await axios.get(apiUrl, { params, timeout: 15000 });

      if (response.data && response.data.features) {
        // Process and store data
        const processedSources = await this.processAPIData(response.data.features);
        
        res.status(200).json({
          success: true,
          count: processedSources.length,
          data: processedSources
        });
      } else {
        res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: "No data available from API"
        });
      }
    } catch (error) {
      console.error("Error fetching from Water Quality Portal:", error.message);
      res.status(500).json({
        success: false,
        message: "Error fetching water quality data from external API",
        error: error.message
      });
    }
  }

  // Process API data and store in database
  async processAPIData(features) {
    const processedSources = [];

    for (const feature of features) {
      try {
        const { properties, geometry } = feature;
        
        if (!geometry || !geometry.coordinates) continue;

        const [lng, lat] = geometry.coordinates;

        // Calculate scores based on available parameters
        const purityScore = this.calculatePurityScore(properties);
        const severityScore = this.calculateSeverityScore(properties);
        const pollutionLevel = this.determinePollutionLevel(purityScore);

        // Check if source already exists
        let waterSource = await WaterSource.findOne({
          externalId: properties.MonitoringLocationIdentifier
        });

        const sourceData = {
          name: properties.MonitoringLocationName || "Unknown Source",
          type: this.determineWaterType(properties),
          location: {
            type: "Point",
            coordinates: [lng, lat]
          },
          qualityMetrics: {
            purityScore,
            pollutionLevel,
            severityScore,
            pH: properties.pH || null,
            dissolvedOxygen: properties.DissolvedOxygen || null,
            turbidity: properties.Turbidity || null,
            temperature: properties.Temperature || null,
          },
          dataSource: "api",
          externalId: properties.MonitoringLocationIdentifier,
          lastUpdated: new Date(),
          isVerified: true,
          isSafeForUse: purityScore >= 70,
        };

        if (waterSource) {
          // Update existing
          Object.assign(waterSource, sourceData);
          await waterSource.save();
        } else {
          // Create new
          waterSource = await WaterSource.create(sourceData);
        }

        processedSources.push(waterSource);
      } catch (error) {
        console.error("Error processing feature:", error);
      }
    }

    return processedSources;
  }

  // Helper: Calculate purity score (0-100)
  calculatePurityScore(properties) {
    let score = 100;

    // Adjust based on available parameters
    if (properties.pH) {
      const pH = parseFloat(properties.pH);
      if (pH < 6.5 || pH > 8.5) score -= 20;
      else if (pH < 7 || pH > 8) score -= 10;
    }

    if (properties.DissolvedOxygen) {
      const DO = parseFloat(properties.DissolvedOxygen);
      if (DO < 5) score -= 30;
      else if (DO < 7) score -= 15;
    }

    if (properties.Turbidity) {
      const turbidity = parseFloat(properties.Turbidity);
      if (turbidity > 50) score -= 25;
      else if (turbidity > 25) score -= 15;
    }

    if (properties.FecalColiform) {
      const fc = parseFloat(properties.FecalColiform);
      if (fc > 200) score -= 40;
      else if (fc > 100) score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Helper: Calculate severity score (0-10)
  calculateSeverityScore(properties) {
    const purityScore = this.calculatePurityScore(properties);
    return Math.round((100 - purityScore) / 10);
  }

  // Helper: Determine pollution level
  determinePollutionLevel(purityScore) {
    if (purityScore >= 80) return "low";
    if (purityScore >= 60) return "moderate";
    if (purityScore >= 40) return "high";
    return "severe";
  }

  // Helper: Determine water type from properties
  determineWaterType(properties) {
    const locationType = properties.MonitoringLocationTypeName?.toLowerCase() || "";
    
    if (locationType.includes("ocean") || locationType.includes("marine")) return "ocean";
    if (locationType.includes("lake")) return "lake";
    if (locationType.includes("river")) return "river";
    if (locationType.includes("stream")) return "stream";
    if (locationType.includes("reservoir")) return "reservoir";
    if (locationType.includes("well")) return "well";
    
    return "stream";
  }

  // Get user reports
  async getUserReports(req, res) {
    try {
      const userId = req.user._id;
      
      const reports = await WaterReport.find({ userId })
        .populate("waterSourceId")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user reports",
        error: error.message
      });
    }
  }

  // Get active alerts
  async getActiveAlerts(req, res) {
    try {
      const { lat, lng, radius = 10000 } = req.query;

      let query = { isActive: true };

      if (lat && lng) {
        const nearbySourceIds = await WaterSource.find({
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              $maxDistance: parseInt(radius)
            }
          }
        }).select("_id");

        query.waterSourceId = { $in: nearbySourceIds.map(s => s._id) };
      }

      const alerts = await WaterAlert.find(query)
        .populate("waterSourceId")
        .sort({ severity: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        count: alerts.length,
        data: alerts
      });
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching alerts",
        error: error.message
      });
    }
  }
}

// Helper function: Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

export default new WaterController();
