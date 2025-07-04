export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

export function formatDistance(distance) {
    if (distance < 1) {
        return `${(distance * 1000).toFixed(0)} m`;
    } else {
        return `${distance.toFixed(2)} km`;
    }
}

export function isServiceOpen(hours) {
    if (hours === "24 Hours" || hours.includes("24")) {
        return true;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simple logic - in a real app, you'd parse the hours string properly
    return currentHour >= 8 && currentHour <= 22;
}

export function getCurrentTimeString() {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}