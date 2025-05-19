import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppointmentCalendar from '../common/AppointmentCalendar';
import { api } from '../../services/api';
import { availability as availabilityApi } from '../../services/api';

const ProviderAvailabilityCalendar = ({ onAvailabilityChange,
    providerId,
    initialTimeBlocks }) => {
    const [appointmentList, setAppointmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeBlocks, setTimeBlocks] = useState({});
    const timeBlocksRef = useRef(timeBlocks);
    const firstRenderRef = useRef(true);

    // Function to save availability directly to API
    const handleSave = useCallback(async () => {
        try {
            console.log("ProviderAvailabilityCalendar: Saving to API directly", timeBlocks);
            
            // Convert Date objects to ISO strings for API
            const apiData = {};
            Object.entries(timeBlocks).forEach(([dateStr, blocks]) => {
                if (blocks && blocks.length > 0) {
                    apiData[dateStr] = blocks.map(block => ({
                        id: block.id,
                        start: block.start instanceof Date ? block.start.toISOString() : block.start,
                        end: block.end instanceof Date ? block.end.toISOString() : block.end
                    }));
                } else {
                    apiData[dateStr] = [];
                }
            });
            
            const response = await availabilityApi.save(providerId, apiData);
            console.log("ProviderAvailabilityCalendar: API save success", response.data);
            
            // Update state with API response
            const formattedData = {};
            Object.entries(response.data).forEach(([dateStr, blocks]) => {
                if (blocks && blocks.length > 0) {
                    formattedData[dateStr] = blocks.map(block => ({
                        id: block.id,
                        start: new Date(block.start),
                        end: new Date(block.end)
                    }));
                } else {
                    formattedData[dateStr] = [];
                }
            });
            
            // Only update state if there are actual changes
            if (JSON.stringify(Object.keys(formattedData).sort()) !== 
                JSON.stringify(Object.keys(timeBlocks).sort())) {
                console.log("ProviderAvailabilityCalendar: Updating state with API response", formattedData);
                setTimeBlocks(formattedData);
            }
            
        } catch (err) {
            console.error("Error saving availability directly:", err);
            setError("Failed to save availability. Please try again.");
        }
    }, [providerId, timeBlocks]);

    // Use a callback for handling availability changes
    const handleAvailabilityChange = useCallback((newAvailability) => {
        console.log("ProviderAvailabilityCalendar: received new availability from calendar:", newAvailability);
        
        // Update local state
        setTimeBlocks(newAvailability);
        
        // Pass changes to parent
        if (onAvailabilityChange) {
            console.log("ProviderAvailabilityCalendar: Calling parent onAvailabilityChange");
            onAvailabilityChange(newAvailability);
        }
        
        // If we have a provider ID, save directly to the API
        if (providerId) {
            handleSave();
        }
    }, [onAvailabilityChange, providerId, handleSave]);

    // Initialize timeBlocks once when component mounts or initialTimeBlocks changes
    useEffect(() => {
        setTimeBlocks(initialTimeBlocks);
    }, [initialTimeBlocks]);

    // Update ref when timeBlocks changes
    useEffect(() => {
        timeBlocksRef.current = timeBlocks;
        console.log("ProviderAvailabilityCalendar: timeBlocks state updated:", timeBlocks);
    }, [timeBlocks]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!providerId) {
                console.log('No provider ID provided, skipping appointment fetch');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                console.log('Token for appointment fetch:', token ? `${token.substring(0, 5)}...` : 'No token');
                
                const response = await api.get(`/appointments/provider/${providerId}/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                
                console.log('Appointments fetched successfully:', response.data.length);
                setAppointmentList(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching appointments:', err);
                let errorMsg = 'Failed to load appointments';
                
                if (err.response) {
                    errorMsg += `: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
                }
                
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [providerId]);

    return (
        <AppointmentCalendar
            mode="provider"
            providerId={providerId}
            onAvailabilityChange={handleAvailabilityChange}
            initialTimeBlocks={timeBlocks}
            title="Your Availability"
            appointments={appointmentList}
            loading={loading}
            error={error}
        />
    );
};

export default ProviderAvailabilityCalendar; 