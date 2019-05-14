import React, { Component, createRef, useState } from 'react'
import Space, { addPlanetOrbit, breakPlanet, removePlanet } from './space'

const { WEBGL, Stats, requestAnimationFrame } = window

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
            {props.selected && (
                <div>
                    <input
                        type="number"
                        value={props.massAdd}
                        onChange={e => {
                            props.handleChangeMassAdd(Number(e.target.value))
                        }}
                    />
                    <button onClick={props.handleToggleAddingPlanet}>
                        {props.addingPlanet ? 'cancel' : 'add planet'}
                    </button>
                    <input
                        type="number"
                        value={props.selected.mass}
                        onChange={e => {
                            props.selected.mass = Number(e.target.value)
                            setState({ m: props.selected.mass })
                        }}
                    />

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

                    <input
                        type="number"
                        value={props.selected.vel.y}
                        onChange={e => {
                            props.selected.vel.setY(Number(e.target.value))
                            setState({ x: props.selected.vel.y })
                        }}
                        step="0.1"
                    />

                    <input
                        type="number"
                        value={props.selected.vel.z}
                        onChange={e => {
                            props.selected.vel.setZ(Number(e.target.value))
                            setState({ x: props.selected.vel.z })
                        }}
                        step="0.1"
                    />

                    <button
                        onClick={() => {
                            breakPlanet(props.selected)
                        }}>
                        BOOM
                    </button>
                    <button
                        onClick={() => {
                            removePlanet(props.selected)
                            props.handleSelect(null)
                        }}>
                        remove this planet
                    </button>
                </div>
            )}
        </div>
    )
}

class App extends Component {
    state = {
        playing: true,
        selected: null,
        addingPlanet: false,
        massAdd: 1
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

    handleChangeMassAdd = value => {
        this.setState({ massAdd: value })
    }

    handleToggleAddingPlanet = () => {
        this.setState({ addingPlanet: !this.state.addingPlanet })
    }

    render() {
        const { playing, massAdd, selected, addingPlanet } = this.state
        return (
            <>
                {WEBGL.isWebGLAvailable() === false &&
                    WEBGL.getWebGLErrorMessage()}
                <canvas
                    onClick={() => {
                        if (addingPlanet) {
                            addPlanetOrbit(selected, massAdd)
                        }
                    }}
                    ref={this.canvas}
                />
                <Panel
                    massAdd={massAdd}
                    playing={playing}
                    handleTogglePlaying={this.handleTogglePlaying}
                    addingPlanet={addingPlanet}
                    selected={selected}
                    handleSelect={this.handleSelect}
                    handleChangeMassAdd={this.handleChangeMassAdd}
                    handleToggleAddingPlanet={this.handleToggleAddingPlanet}
                />
            </>
        )
    }
}

export default App
