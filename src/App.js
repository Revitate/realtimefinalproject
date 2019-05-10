import React, { Component, createRef } from 'react'
import Space from './space'

const { WEBGL, Stats, requestAnimationFrame } = window

class App extends Component {
    state = {
        playing: true
    }

    constructor(props) {
        super(props)
        this.canvas = createRef(null)
    }

    componentDidMount() {
        if (WEBGL.isWebGLAvailable() === false) {
            return
        }
        const stats = new Stats()
        document.body.appendChild(stats.dom)

        Space.init(this.canvas.current)

        const loop = time => {
            requestAnimationFrame(loop)
            Space.update(time, this.state.playing)

            stats.update()
        }

        requestAnimationFrame(loop)
    }

    handleTogglePlaying = () => {
        this.setState({ playing: !this.state.playing })
    }

    render() {
        const { playing } = this.state
        return (
            <>
                {WEBGL.isWebGLAvailable() === false &&
                    WEBGL.getWebGLErrorMessage()}
                <canvas ref={this.canvas} />
                <div className="panel">
                    <button onClick={this.handleTogglePlaying}>
                        {playing ? 'stop' : 'start'}
                    </button>
                </div>
            </>
        )
    }
}

export default App
