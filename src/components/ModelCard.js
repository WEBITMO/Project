import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    Avatar,
    Box,
    IconButton, Tooltip
} from '@mui/material';
import PropTypes from 'prop-types';
import {useNavigate} from "react-router-dom";
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ImageIcon from '@mui/icons-material/Image';
import UpdateIcon from '@mui/icons-material/Update';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ArticleIcon from '@mui/icons-material/Article';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num;
};

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

const getPipelineIcon = (pipeline_tag) => {
    if (pipeline_tag.includes('text')) return <ArticleIcon sx={{marginRight: 1}}/>;
    if (pipeline_tag.includes('speech')) return <AudioFileIcon sx={{marginRight: 1}}/>;
    if (pipeline_tag.includes('image')) return <ImageIcon sx={{marginRight: 1}}/>;
    if (pipeline_tag.includes('object-detection')) return <ImageSearchIcon sx={{marginRight: 1}}/>;
    return <QuestionMarkIcon sx={{marginRight: 1}}/>;
};

const modelPropTypes = {
    model: PropTypes.shape({
        id: PropTypes.string.isRequired,
        pipeline_tag: PropTypes.string.isRequired,
        available: PropTypes.bool.isRequired,
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

const ModelCard = ({model}) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/${model.pipeline_tag}/${model.id}`);
    };

    return (
        <Card variant="outlined" sx={{marginBottom: 2}}>
            <CardHeader
                avatar={
                    <Avatar src={model.authorData.avatarUrl || ''}>
                        {model.authorData.name ? model.authorData.name[0] : '?'}
                    </Avatar>
                }
                action={
                    model.available && (
                        <Tooltip title="Go to model page" placement="top">
                            <IconButton aria-label="settings" onClick={handleNavigate}>
                                <ExitToAppIcon/>
                            </IconButton>
                        </Tooltip>
                    )
                }
                title={model.id.split('/')[1]}
                subheader={model.id.split('/')[0]}
                titleTypographyProps={{fontWeight: 'bold'}}
            />
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={1}>
                    <Box display="flex" alignItems="center">
                        {getPipelineIcon(model.pipeline_tag)}
                        <Typography variant="subtitle1" color="text.secondary">
                            {model.pipeline_tag}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                        <FavoriteIcon sx={{marginRight: 1}}/>
                        <Typography variant="subtitle1" color="text.secondary">
                            {formatNumber(model.likes)}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                        <UpdateIcon sx={{marginRight: 1}}/>
                        <Typography variant="subtitle1" color="text.secondary">
                            {timeAgo(model.lastModified)}
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <DownloadIcon sx={{marginRight: 1}}/>
                        <Typography variant="subtitle1" color="text.secondary">
                            {formatNumber(model.downloads)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

ModelCard.propTypes = modelPropTypes;

export default ModelCard;