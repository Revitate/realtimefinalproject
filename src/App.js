import React, { Component, createRef } from 'react'
import Space from './space'

const { WEBGL, Stats, requestAnimationFrame } = window

class App extends Component {
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

            Space.update(time)

            stats.update()
        }

        requestAnimationFrame(loop)
    }
    render() {
        return (
            <>
                {WEBGL.isWebGLAvailable() === false &&
                    WEBGL.getWebGLErrorMessage()}
                <canvas ref={this.canvas} />
            </>
        )
    }
}

export default App
