import React, { Component, createRef, useState } from 'react'
import Space, { addPlanet, breakPlanet } from './space'

const { WEBGL, THREE, Stats, requestAnimationFrame } = window

const Panel = props => {
    const [_, setState] = useState({
        m: 0,
        x: 0,
        y: 0,
        z: 0
    })
    return (
        <div className="panel">
            <button onClick={props.handleTogglePlaying}>
                {props.playing ? 'stop' : 'start'}
            </button>
            <button
                onClick={() => {
                    addPlanet(
                        THREE.Math.randFloat(-200, 200),
                        THREE.Math.randFloat(-200, 200),
                        THREE.Math.randFloat(-200, 200),
                        THREE.Math.randFloat(3, 20)
                    )
                }}
            >
                add planet
            </button>
            {props.selected && (
                <div>
                    <input
                        type="number"
                        value={props.selected.mass}
                        onChange={e => {
                            props.selected.mass = Number(e.target.value)
                            setState({ m: props.selected.mass })
                        }}
                    />
                    <br />
                    <input
                        type="number"
                        value={props.selected.vel.x}
                        onChange={e => {
                            console.log(props.selected)
                            props.selected.vel.setX(Number(e.target.value))
                            setState({ x: props.selected.vel.x })
                        }}
                        step="0.1"
                    />
                    <br />
                    <input
                        type="number"
                        value={props.selected.vel.y}
                        onChange={e => {
                            props.selected.vel.setY(Number(e.target.value))
                            setState({ x: props.selected.vel.y })
                        }}
                        step="0.1"
                    />
                    <br />
                    <input
                        type="number"
                        value={props.selected.vel.z}
                        onChange={e => {
                            props.selected.vel.setZ(Number(e.target.value))
                            setState({ x: props.selected.vel.z })
                        }}
                        step="0.1"
                    />
                    <br />
                    <button
                        onClick={() => {
                            breakPlanet(props.selected)
                        }}
                    >
                        BOOM
                    </button>
                </div>
            )}
        </div>
    )
}

class App extends Component {
    state = {
        playing: true,
        selected: null
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

        Space.init(this.canvas.current, this.handleSelect)

        const loop = time => {
            requestAnimationFrame(loop)
            Space.update(
                time,
                this.state.playing,
                this.state.selected,
                this.toggleTrigger
            )

            stats.update()
        }

        requestAnimationFrame(loop)
    }

    handleSelect = planet => {
        this.setState({ selected: planet })
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
                <Panel
                    playing={playing}
                    handleTogglePlaying={this.handleTogglePlaying}
                    selected={this.state.selected}
                />
            </>
        )
    }
}

export default App
