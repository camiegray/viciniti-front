import React, { useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import { appointments, services } from '../../services/api';

const AppointmentCalendar = React.forwardRef(({ serviceId, onAppointmentBooked }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeBlocks, setTimeBlocks] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [userAppointments, setUserAppointments] = useState([]);
    const [serviceAvailability, setServiceAvailability] = useState([]);

    const fetchUserAppointments = useCallback(async () => {
        try {
            const response = await appointments.getUserAppointments();
            setUserAppointments(response.data);
        } catch (err) {
            console.error('Error fetching user appointments:', err);
        }
    }, []);

    const fetchServiceAvailability = useCallback(async () => {
        if (!serviceId) return;
        try {
            const response = await services.getAvailability(serviceId);
            setServiceAvailability(response.data);
        } catch (err) {
            console.error('Error fetching service availability:', err);
        }
    }, [serviceId]);

    useImperativeHandle(ref, () => ({
        refreshAppointments: fetchUserAppointments,
        refreshAvailability: fetchServiceAvailability
    }), [fetchUserAppointments, fetchServiceAvailability]);

    useEffect(() => {
        fetchUserAppointments();
        fetchServiceAvailability();
    }, [fetchUserAppointments, fetchServiceAvailability]);

    useEffect(() => {
        if (timeBlocks && Object.keys(timeBlocks).length > 0) {
            // Process time blocks
            console.log('Processing time blocks:', timeBlocks);
        }
    }, [timeBlocks]);

    if (loading && Object.keys(timeBlocks).length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            width: '100%', 
            maxWidth: '100%',
            overflow: 'hidden',
            mr: 0,
            minHeight: '580px'
        }}>
            {/* Calendar content */}
        </Box>
    );
});

export default AppointmentCalendar; 