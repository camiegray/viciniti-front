import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Alert,
    Paper,
    Rating,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Collapse,
    Card,
    CardMedia,
    CardContent,
    CardActions,
} from '@mui/material';
import { services } from '../../services/api';

const ServiceBrowser = () => {
    const navigate = useNavigate();
    const [serviceList, setServiceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [expandedService, setExpandedService] = useState(null);

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await services.getAll();
            setServiceList(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load services');
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await services.getCategories();
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleExpandClick = (serviceId) => {
        setExpandedService(expandedService === serviceId ? null : serviceId);
    };

    const handleServiceClick = (serviceId) => {
        navigate(`/services/${serviceId}`);
    };

    // Filter and sort services
    const filteredServices = serviceList
        .filter(service => {
            const matchesCategory = !selectedCategory || service.category === selectedCategory;
            const matchesSearch = !searchQuery || 
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Filters */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Search Services"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        label="Category"
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        {categories.map(category => (
                                            <MenuItem key={category.value} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Sort By</InputLabel>
                                    <Select
                                        value={sortBy}
                                        onChange={handleSortChange}
                                        label="Sort By"
                                    >
                                        <MenuItem value="name">Name</MenuItem>
                                        <MenuItem value="price_asc">Price: Low to High</MenuItem>
                                        <MenuItem value="price_desc">Price: High to Low</MenuItem>
                                        <MenuItem value="rating">Rating</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Service List */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {filteredServices.map(service => (
                            <Grid item xs={12} sm={6} md={4} key={service.id}>
                                <Paper 
                                    sx={{ 
                                        p: 2,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            boxShadow: 3
                                        }
                                    }}
                                    onClick={() => handleServiceClick(service.id)}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        {service.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {service.description}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" color="primary">
                                            ${service.price}
                                        </Typography>
                                        <Rating value={service.rating || 0} readOnly precision={0.5} />
                                    </Box>
                                    <Chip 
                                        label={service.category} 
                                        size="small" 
                                        sx={{ mt: 1 }}
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ServiceBrowser; 