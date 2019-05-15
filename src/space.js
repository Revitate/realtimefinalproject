import Planet from './planet'
import { vertexShader, fragmentShader } from './shader'
import WorkerRunner from './workerRunner'

const { THREE } = window

const MAX_PLANETS = 1000
const FOV = 55

export function addPlanet(x, y, z, m) {
    if (planetsNotActive.length > 0) {
        const planet = planetsNotActive.splice(0, 1)[0]
        planet.init(x, y, z, m)
        let red = Math.random()
        let green = Math.random()
        let blue = Math.random()
        if (red + green + blue < 1) {
            const diff = 1 - red + green + blue
            red = red + diff / 3
            green = green + diff / 3
            blue = blue + diff / 3
        }
        planet.setColor(red, green, blue)
        // scene.add(planet.line)
        return planet
    }
}

export const addPlanetOrbit = (selected, mass) => {
    const camDirection = camera
        .getWorldDirection(new THREE.Vector3())
        .normalize() // camera normal direction

    const camPlane = new THREE.Plane(camDirection)
    const positionArray = geometry.attributes.position.array
    const index = selected.index * 3
    const selectedPos = new THREE.Vector3(
        positionArray[index],
        positionArray[index + 1],
        positionArray[index + 2]
    )
    camPlane.translate(selectedPos)
    raycaster.setFromCamera(mouse, camera)
    const ray = raycaster.ray
    const pos = ray.intersectPlane(camPlane, new THREE.Vector3())
    const planet = addPlanet(pos.x, pos.y, pos.z, mass)
    const radiusVector = new THREE.Vector3().subVectors(selectedPos, pos)
    if (planet === undefined) return
    const vel = new THREE.Vector3()
        .crossVectors(radiusVector.clone().normalize(), camDirection)
        .setLength(
            Math.sqrt(
                ((6.67 * selected.getMass()) / radiusVector.length()) * 10000
            )
        )
    planet.setVel(vel.x, vel.y, vel.z)
}

export function removePlanet(planet) {
    planet.destroy()
    planetsNotActive.push(planet)
    //  scene.remove(planet.line)
}

export function breakPlanet(planet) {
    const numberOfShard = THREE.Math.randInt(3, 7)
    let mass = planet.mass
    const positions = geometry.attributes.position.array
    const sizes = geometry.attributes.size.array
    const index = planet.index * 3
    let momentum = planet.getVel().multiplyScalar(mass)
    for (let i = 0; i < numberOfShard - 1; i++) {
        const newMass = THREE.Math.randFloat(1, mass * 0.0000005)
        const velocity = new THREE.Vector3(
            THREE.Math.randFloat(-1, 1),
            THREE.Math.randFloat(-1, 1),
            THREE.Math.randFloat(-1, 1)
        ).multiplyScalar(THREE.Math.randFloat(5000, 60000))
        const addPosition = velocity
            .clone()
            .normalize()
            .setLength(sizes[planet.index])
        const newPlanet = addPlanet(
            positions[index] + addPosition.x,
            positions[index + 1] + addPosition.y,
            positions[index + 2] + addPosition.z,
            newMass
        )
        if (newPlanet === undefined) break
        newPlanet.setVel(velocity.x, velocity.y, velocity.z)
        momentum.sub(velocity.multiplyScalar(newMass))
        mass = mass - newMass
    }
    planet.mass = mass
    const vel = momentum.divideScalar(mass)
    planet.setVel(vel.x, vel.y, vel.z)
}

let canvas, handleSelect
function init(_canvas, _handleSelect) {
    canvas = _canvas
    handleSelect = _handleSelect

    initScene()

    initPlanetGeometry()

    initWorker()

    initMouseRaycast()

    addPlanet(0, 0, 0, 2000000)
    for (let i = 1; i < 200; i++) {
        addPlanet(
            THREE.Math.randFloat(-300, 300),
            THREE.Math.randFloat(-300, 300),
            THREE.Math.randFloat(-300, 300),
            6
        )
    }
}

let scene, camera, renderer, controls
function initScene() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(
        FOV,
        (window.innerWidth - 300) / window.innerHeight,
        0.1,
        1000000
    )
    camera.position.y = 500
    camera.lookAt(0, 0, 0)
    controls = new THREE.OrbitControls(camera, canvas)
<<<<<<< HEAD
    renderer = new THREE.WebGLRenderer({ canvas })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth - 300, window.innerHeight)
    window.addEventListener('resize', onWindowResize, false)
}

let geometry, material, sphere
const planetGroup = new THREE.Group()
const planetsNotActive = []
const planets = []
function initPlanetGeometry() {
    geometry = new THREE.BufferGeometry()
=======
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.25
>>>>>>> a02d18f696acc452c4929fa042336a85a5d3b481

    const positions = new Float32Array(MAX_PLANETS * 3)
    const velocity = new Float32Array(MAX_PLANETS * 3)
    const colors = new Float32Array(MAX_PLANETS * 3)
    const active = new Uint8Array(MAX_PLANETS)
    const mass = new Float32Array(MAX_PLANETS)
    const size = new Float32Array(MAX_PLANETS)
    const select = new Uint8Array(MAX_PLANETS)

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('velocity', new THREE.BufferAttribute(velocity, 3))
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('active', new THREE.BufferAttribute(active, 1))
    geometry.addAttribute('mass', new THREE.BufferAttribute(mass, 1))
    geometry.addAttribute('size', new THREE.BufferAttribute(size, 1))
    geometry.addAttribute('select', new THREE.BufferAttribute(select, 1))

    for (let i = 0; i < MAX_PLANETS; i++) {
        const planet = new Planet(i, geometry)
        planetsNotActive.push(planet)
        planets.push(planet)
    }
    material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        vertexColors: THREE.VertexColors,
        transparent: true,
        uniforms: {
            texture: {
                type: 't',
                value: new THREE.TextureLoader().load('img/planet-noglow.png')
            },
            glow: {
                type: 't',
                value: new THREE.TextureLoader().load('img/planet-glow.png')
            },
            screenHeight: {
                value: window.innerHeight
            },
            fov: {
                value: FOV
            }
        }
    })

    const planetsMesh = new THREE.Points(geometry, material)
    planetGroup.add(planetsMesh)
    scene.add(planetGroup)

    // background
    const sphereGeometry = new THREE.SphereGeometry(900000, 32, 32)
    const texture = new THREE.TextureLoader().load('img/space_background.jpeg')
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    })
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)
}

const updateVelWorkers = []
const updatePosWorkers = []
function initWorker() {
    const numberWorker = navigator.hardwareConcurrency || 4
    const iterPerWorker = Math.ceil(MAX_PLANETS / numberWorker)
    for (let i = 0; i < MAX_PLANETS; i += iterPerWorker) {
        const st = i
        const ed = Math.min(i + iterPerWorker, MAX_PLANETS)
        updateVelWorkers.push(
            new WorkerRunner('./js/updateVelWorker.js', st, ed)
        )
        updatePosWorkers.push(
            new WorkerRunner('./js/updatePosWorker.js', st, ed)
        )
    }
}

let mouse, raycaster
function initMouseRaycast() {
    raycaster = new THREE.Raycaster()
    raycaster.params.Points.pointSize = geometry.attributes.size.array
    raycaster.params.Points.active = geometry.attributes.active.array
    raycaster.params.Points.camera = camera
    mouse = new THREE.Vector2()
    canvas.addEventListener('mousemove', onMouseMove, false)
    canvas.addEventListener('click', onMouseClick, false)
}
function onMouseClick() {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(planetGroup.children)
    if (intersects.length > 0) {
        const targetIndex = intersects[0].index
        if (selected && selected.index === targetIndex) {
            handleSelect(null)
        } else {
            handleSelect(planets[targetIndex])
        }
    }
}
function onMouseMove(event) {
    mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1
    mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1
}

function onWindowResize() {
    camera.aspect = (window.innerWidth - 300) / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth - 300, window.innerHeight)
    material.uniforms.screenHeight.value = window.innerHeight
}

let prevTime = 0,
    selected
async function update(time, isPlaying, _selected, timestep) {
    selected = _selected

    const delta = time - prevTime
    prevTime = time
    const simdelta = (timestep * delta) / 1000

<<<<<<< HEAD
    await updateloop(isPlaying, simdelta)

=======
    if (isPlaying) {
        for (let i = 0; i < planets.length; i++) {
            if (planets[i].isActive()) {
                for (let j = 0; j < planets.length; j++) {
                    if (i !== j && planets[j].isActive()) {
                        planets[i].applyForceFrom(planets[j])
                    }
                }
            }
        }
        for (let i = 0; i < planets.length; i++) {
            if (planets[i].isActive()) {
                if (planets[i].needRemove(camera)) {
                    removePlanet(planets[i])
                } else {
                    planets[i].update(simdelta)
                }
            }
        }
    }
>>>>>>> a02d18f696acc452c4929fa042336a85a5d3b481
    for (let i = 0; i < planets.length; i++) {
        if (selected && i === selected.index) {
            geometry.attributes.select.array[i] = 1
        } else {
            geometry.attributes.select.array[i] = 0
        }
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    geometry.attributes.size.needsUpdate = true
    geometry.attributes.mass.needsUpdate = true
    geometry.attributes.select.needsUpdate = true
    geometry.attributes.active.needsUpdate = true

    sphere.position.copy(camera.position)

    renderer.render(scene, camera)
    controls.update()
}
async function updateloop(isPlaying, simdelta) {
    if (isPlaying) {
        const position = geometry.attributes.position.array
        const velocity = geometry.attributes.velocity.array
        const mass = geometry.attributes.mass.array
        const active = geometry.attributes.active.array
        const vels = await Promise.all(
            updateVelWorkers.map(worker =>
                worker.postMessage({
                    position,
                    velocity,
                    mass,
                    active,
                    delta: simdelta
                })
            )
        )
        for (let i = 0; i < updateVelWorkers.length; i++) {
            const st = updateVelWorkers[i].st * 3
            for (let j = 0; j < vels[i].data.length; j++) {
                velocity[st + j] = vels[i].data[j]
            }
        }
        const poss = await Promise.all(
            updatePosWorkers.map(worker =>
                worker.postMessage({
                    position,
                    velocity,
                    active,
                    delta: simdelta
                })
            )
        )
        for (let i = 0; i < updatePosWorkers.length; i++) {
            const st = updatePosWorkers[i].st * 3
            for (let j = 0; j < poss[i].data.length; j++) {
                position[st + j] = poss[i].data[j]
            }
        }
    }
}

export default { init, update }
