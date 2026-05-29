import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMandiById,
  updateMandiLocation,
  updateMandiStatus,
} from "../api/api";

const TripPage = () => {
  const { id } = useParams();

  const [mandi, setMandi] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [loading, setLoading] = useState(false);

  // LOCATION STATES
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");

  // ESTIMATION STATES
  const [distance, setDistance] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  // LOAD DATA
  const loadMandi = async () => {
    try {
      const res = await getMandiById(id);

      setMandi(res.data);

      if (res.data.status === "onTrip") {
        setTracking(true);
      } else {
        setTracking(false);
      }
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  // AUTO REFRESH
  useEffect(() => {
    loadMandi();

    const interval = setInterval(() => {
      loadMandi();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  // CALCULATE DISTANCE + TIME
  const calculateEstimate = async () => {
    if (!startLocation || !destination) {
      alert("Please enter start and destination");
      return false;
    }

    try {
      // GOOGLE MAP URL
      const mapURL = `https://www.google.com/maps/dir/${encodeURIComponent(
        startLocation
      )}/${encodeURIComponent(destination)}`;

      // OPEN MAP
      window.open(mapURL, "_blank");

      // DEMO CALCULATION
      const generatedDistance =
        Math.floor(Math.random() * 180) + 20;

      const generatedTime =
        (generatedDistance / 45).toFixed(1);

      setDistance(`${generatedDistance} KM`);
      setEstimatedTime(`${generatedTime} Hours Approx`);

      return true;
    } catch (err) {
      console.log("ESTIMATE ERROR:", err);
      return false;
    }
  };

  // START TRIP
  const startTrip = async () => {
    try {
      if (!navigator.geolocation) {
        return alert("Geolocation not supported");
      }

      const valid = await calculateEstimate();

      if (!valid) return;

      setLoading(true);

      // UPDATE STATUS
      await updateMandiStatus(id, {
        status: "onTrip",
        tripStarted: true,
      });

      // START GPS TRACKING
      const gpsWatchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            console.log("LIVE LOCATION:", lat, lng);

            await updateMandiLocation(id, {
              lat,
              lng,
            });

            loadMandi();
          } catch (err) {
            console.log("LOCATION UPDATE ERROR:", err);
          }
        },

        (err) => {
          console.log("GPS ERROR:", err);

          if (err.code === 1) {
            alert("Location permission denied");
          } else {
            alert("Unable to access location");
          }
        },

        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      setWatchId(gpsWatchId);

      setTracking(true);

      setLoading(false);

      alert("Trip Started Successfully");
    } catch (err) {
      console.log("START TRIP ERROR:", err);
      setLoading(false);
    }
  };

  // END TRIP
  const endTrip = async () => {
    try {
      setLoading(true);

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      await updateMandiLocation(id, {
        endTrip: true,
      });

      await updateMandiStatus(id, {
        status: "completed",
        tripStarted: false,
        isBooked: false,
      });

      setTracking(false);

      setWatchId(null);

      await loadMandi();

      setLoading(false);

      alert("Trip Ended Successfully");
    } catch (err) {
      console.log("END TRIP ERROR:", err);
      setLoading(false);
    }
  };

  if (!mandi) {
    return (
      <div className="p-6 text-xl text-black">
        Loading Trip Data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6 text-black">

      <h1 className="text-3xl font-bold text-green-700">
        🚛 Smart Trip Tracking
      </h1>

      <div className="bg-white mt-5 rounded-2xl shadow-lg p-5">

        <p className="text-lg font-semibold">
          👨 Driver: {mandi.driverName}
        </p>

        <p className="text-lg mt-2">
          📞 Phone: {mandi.driverPhone}
        </p>

        <p className="mt-3">
          Status:
          <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
            {mandi.status}
          </span>
        </p>

        {/* LOCATION INPUTS */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">

          <input
            type="text"
            placeholder="Enter Starting Location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl outline-none"
          />

          <input
            type="text"
            placeholder="Enter Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl outline-none"
          />

        </div>

        {/* CALCULATE BUTTON */}
        <button
          onClick={calculateEstimate}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold"
        >
          📍 Calculate Route
        </button>

        {/* ESTIMATION UI */}
        <div className="mt-5 bg-gray-100 p-4 rounded-xl">

          <p className="font-semibold text-green-700">
            📍 Start Location:
          </p>

          <p className="mt-1">
            {startLocation || "Not Entered"}
          </p>

          <p className="font-semibold text-red-700 mt-4">
            🏁 Destination:
          </p>

          <p className="mt-1">
            {destination || "Not Entered"}
          </p>

          <p className="font-semibold text-blue-700 mt-4">
            📏 Estimated Distance:
          </p>

          <p className="mt-1">
            {distance || "Not Calculated"}
          </p>

          <p className="font-semibold text-purple-700 mt-4">
            ⏰ Estimated Time:
          </p>

          <p className="mt-1">
            {estimatedTime || "Not Calculated"}
          </p>

        </div>

        {/* LIVE GPS */}
        {mandi.driverLocation?.lat && (
          <div className="mt-5 border-t pt-4">

            <h2 className="font-bold text-lg text-blue-700 mb-3">
              📍 Live Driver Location
            </h2>

            <p className="mb-2">
              <span className="font-semibold">
                Latitude:
              </span>

              <span className="ml-2 text-blue-600">
                {mandi.driverLocation.lat}
              </span>
            </p>

            <p className="mb-2">
              <span className="font-semibold">
                Longitude:
              </span>

              <span className="ml-2 text-blue-600">
                {mandi.driverLocation.lng}
              </span>
            </p>

            <a
              href={`https://www.google.com/maps?q=${mandi.driverLocation.lat},${mandi.driverLocation.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
            >
              📍 Open Live Map
            </a>

          </div>
        )}

      </div>

      {/* BUTTONS */}
    
<div className="mt-6 flex gap-4">

  {!tracking ? (
    <button
      disabled={loading}
      onClick={startTrip}
      className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
    >
      {loading ? "Starting..." : "🚛 Start Trip"}
    </button>
  ) : (
    <button
      disabled={loading}
      onClick={endTrip}
      className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold"
    >
      {loading ? "Ending..." : "🛑 End Trip"}
    </button>
  )}

</div>
    </div>
  );
};

export default TripPage;