import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';

class SeekableVideo extends React.Component {
    constructor(props) {
        super(props);
        this.videoPlayerRef = React.createRef();
        this.state = {
            seeked: false
        };
    }

    render() {
        const {seekToSecs, ...rest} = this.props; // eslint-disable-line no-unused-vars

        return (
            <ReactPlayer
                ref={this.videoPlayerRef}
                {...rest}
                onReady={() => {
                    if (this.props.seekToSecs && !this.state.seeked) {
                        this.videoPlayerRef.current.seekTo(this.props.seekToSecs, 'seconds');
                        this.setState({
                            seeked: true
                        });
                    }
                }}
            />
        );
    }
}

SeekableVideo.propTypes = {
    seekToSecs: PropTypes.number
};

export default SeekableVideo;
