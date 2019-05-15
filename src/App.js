import React, { Component, createRef, useState } from 'react'
import Space, { addPlanetOrbit, breakPlanet, removePlanet } from './space'

const { WEBGL, Stats, requestAnimationFrame } = window

let timeStep = Math.pow(10, 6)

const Input = props => (
    <div className="Input">
        <span dangerouslySetInnerHTML={{ __html: props.frontText }} />
        <input
            type={props.type}
            value={props.value}
            onChange={props.onChange}
            min={props.min}
            max={props.max}
            step={props.step}
            style={props.inputStyle}
        />
        <span dangerouslySetInnerHTML={{ __html: props.backText }} />
    </div>
)

const Panel = props => {
    // eslint-disable-next-line no-unused-vars
    const [state, setState] = useState({
        m: 0,
        x: 0,
        y: 0,
        z: 0,
        timeStep: Math.log10(timeStep)
    })
    return (
        <div className="panel">
            <Input
                type="range"
                min={5}
                max={8}
                defaultValue={state.timeStep}
                onChange={e => {
                    timeStep = Math.pow(10, Number(e.target.value))
                    setState({ timeStep: Number(e.target.value) })
                }}
                step={0.1}
                inputStyle={{ width: '100%' }}
            />
            <div> Speed up : {Math.round(timeStep)} times</div>
            <button onClick={props.handleTogglePlaying}>
                {props.playing ? 'Stop' : 'Start'}
            </button>
            {props.selected && (
                <>
                    <div>
                        <h3>Add New Planet</h3>
                        <Input
                            frontText="mass : "
                            backText=" x 10<sup>24</sup> kg"
                            type="number"
                            value={props.massAdd}
                            onChange={e => {
                                props.handleChangeMassAdd(
                                    Number(e.target.value)
                                )
                            }}
                        />
                        <button onClick={props.handleToggleAddingPlanet}>
                            {props.addingPlanet ? 'Cancel' : 'Add Planet'}
                        </button>
                    </div>
                    <div>
                        <h3>Selected Planet</h3>
                        <Input
                            frontText="mass : "
                            backText=" x 10<sup>24</sup> kg"
                            type="number"
                            value={props.selected.getMass()}
                            onChange={e => {
                                props.selected.setSize(Number(e.target.value))
                                setState({ m: props.selected.getMass() })
                            }}
                        />
                        <h4>Velocity</h4>
                        <Input
                            frontText="x : "
                            backText=" m/s"
                            type="number"
                            value={props.selected.getVel().x}
                            onChange={e => {
                                props.selected.setVelX(Number(e.target.value))
                                setState({ x: props.selected.getVel().x })
                            }}
                            step="0.1"
                        />

                        <Input
                            frontText="y : "
                            backText=" m/s"
                            type="number"
                            value={props.selected.getVel().y}
                            onChange={e => {
                                props.selected.setVelY(Number(e.target.value))
                                setState({ x: props.selected.getVel().y })
                            }}
                            step="0.1"
                        />

                        <Input
                            frontText="z : "
                            backText=" m/s"
                            type="number"
                            value={props.selected.getVel().z}
                            onChange={e => {
                                props.selected.setVelZ(Number(e.target.value))
                                setState({ x: props.selected.getVel().z })
                            }}
                            step="0.1"
                        />
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                breakPlanet(props.selected)
                            }}
                        >
                            Explode This Planet
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                removePlanet(props.selected)
                                props.handleSelect(null)
                            }}
                        >
                            Remove This Planet
                        </button>
                    </div>
                </>
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

        const loop = async time => {
            requestAnimationFrame(loop)
            await Space.update(
                time,
                this.state.playing,
                this.state.selected,
                timeStep
            )
            stats.update()
        }

        requestAnimationFrame(loop)
    }

    handleSelect = planet => {
        if (planet === null) {
            this.setState({ selected: planet, addingPlanet: false })
        } else {
            this.setState({ selected: planet })
        }
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
                        if (addingPlanet && selected) {
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
