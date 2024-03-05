import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    CardHeader,
    Avatar,
} from '@mui/material';
import PropTypes from 'prop-types';

// Helper function to format number with thousands separators
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Helper function to calculate "time ago" format
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
};

// Defining the PropTypes for the ModelCard component
const modelPropTypes = {
    model: PropTypes.shape({
        id: PropTypes.string.isRequired,
        lastModified: PropTypes.string.isRequired,
        downloads: PropTypes.number.isRequired,
        likes: PropTypes.number.isRequired,
        authorData: PropTypes.shape({
            avatarUrl: PropTypes.string,
            fullname: PropTypes.string,
            name: PropTypes.string,
            type: PropTypes.string
        })
    }).isRequired
};

// ModelCard Component
const ModelCard = ({ model }) => (
    <Card variant="outlined" sx={{ marginBottom: 2 }}>
        <CardHeader
            avatar={
                model.authorData.avatarUrl ? (
                    <Avatar src={model.authorData.avatarUrl} />
                ) : (
                    <Avatar>{model.authorData.name ? model.authorData.name[0] : '?'}</Avatar>
                )
            }
            title={model.id}
            subheader={model.authorData.type === 'org' ? 'Organization' : 'Individual'}
            titleTypographyProps={{ fontWeight: 'bold' }}
        />
        <CardContent>
            <Typography variant="body2" color="text.secondary">
                Updated {timeAgo(model.lastModified)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {formatNumber(model.downloads)} downloads
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {model.likes} likes
            </Typography>
        </CardContent>
    </Card>
);

ModelCard.propTypes = modelPropTypes;

export default ModelCard;
