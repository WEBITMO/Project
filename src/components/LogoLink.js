import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import * as PropTypes from "prop-types";

class LogoLink extends React.Component {
  render() {
    let {onClick} = this.props;
    return (
      <Link to="/"
            style={{textDecoration: 'none', flexGrow: 1, display: 'flex', alignItems: 'center', color: 'inherit'}}
            onClick={onClick}>
        <Typography variant="h6" noWrap component="div">
          Neural Networks HUB
        </Typography>
      </Link>
    );
  }
}

LogoLink.propTypes = {onClick: PropTypes.any}

export default LogoLink;
