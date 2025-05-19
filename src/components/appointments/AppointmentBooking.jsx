import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import { services } from '../../services/api';
import ConsumerAppointmentCalendar from './ConsumerAppointmentCalendar';

const AppointmentBooking = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchService = useCallback(async () => {
        if (!serviceId) return;
        try {
            const response = await services.getById(parseInt(serviceId));
            setService(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [serviceId]);

    useEffect(() => {
        fetchService();
    }, [fetchService]);

    const handleAppointmentBooked = () => {
        navigate('/appointments');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ... existing code ...
        } catch (err) {
            setError(err.message);
            // ... existing code ...
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }

    if (!service || !serviceId) {
        return (
            <Alert severity="error">
                Service not found
            </Alert>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', height: 'calc(100vh - 120px)', mx: 'auto' }}>
            <Paper>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <ConsumerAppointmentCalendar 
                        serviceId={parseInt(serviceId)}
                        daysToShow={5}
                        onAppointmentBooked={handleAppointmentBooked}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default AppointmentBooking; 