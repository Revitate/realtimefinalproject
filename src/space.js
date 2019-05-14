import Planet from './planet'
import { vertexShader, fragmentShader } from './shader'
const { THREE } = window

let canvas, scene, camera, renderer, controls, mouse, raycaster
const planetGroup = new THREE.Group()

let handleSelect

const MAX_PLANETS = 100
const FOV = 55
let planetsMesh
let sphere
const planetsNotActive = []
const planets = []

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
    const positionArray = planetsMesh.geometry.attributes.position.array
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
    planet.vel
        .copy(
            new THREE.Vector3().crossVectors(
                radiusVector.clone().normalize(),
                camDirection
            )
        )
        .setLength(
            Math.sqrt(((6.67 * selected.mass) / radiusVector.length()) * 10000)
        )
}

export function removePlanet(planet) {
    planet.destroy()
    planetsNotActive.push(planet)
    //  scene.remove(planet.line)
}

export function breakPlanet(planet) {
    const numberOfShard = THREE.Math.randInt(3, 7)
    let mass = planet.mass
    const positions = planetsMesh.geometry.attributes.position.array
    const sizes = planetsMesh.geometry.attributes.size.array
    const index = planet.index * 3
    let momentum = new THREE.Vector3().copy(planet.vel).multiplyScalar(mass)
    for (let i = 0; i < numberOfShard - 1; i++) {
        const newMass = THREE.Math.randFloat(1, mass * 0.0000005)
        const velocity = new THREE.Vector3(
            Math.random(),
            Math.random(),
            Math.random()
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
        newPlanet.vel.copy(velocity)
        momentum.sub(velocity.multiplyScalar(newMass))
        mass = mass - newMass
    }
    planet.mass = mass
    planet.vel.copy(momentum.divideScalar(mass))
}

function init(_canvas, _handleSelect) {
    canvas = _canvas
    handleSelect = _handleSelect
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(
        FOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000000
    )

    camera.position.y = 500
    camera.lookAt(0, 0, 0)

    controls = new THREE.OrbitControls(camera, canvas)

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(MAX_PLANETS * 3)
    const colors = new Float32Array(MAX_PLANETS * 3)
    const active = new Uint8Array(MAX_PLANETS)
    const size = new Float32Array(MAX_PLANETS)
    const select = new Uint8Array(MAX_PLANETS)

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('active', new THREE.BufferAttribute(active, 1))
    geometry.addAttribute('size', new THREE.BufferAttribute(size, 1))
    geometry.addAttribute('select', new THREE.BufferAttribute(select, 1))
    console.log(geometry)

    raycaster = new THREE.Raycaster()
    raycaster.params.Points.pointSize = geometry.attributes.size.array
    raycaster.params.Points.camera = camera
    raycaster.params.Points.active = active
    mouse = new THREE.Vector2()

    for (let i = 0; i < MAX_PLANETS; i++) {
        const planet = new Planet(i, geometry)
        planetsNotActive.push(planet)
        planets.push(planet)
    }

    const p1 = addPlanet(0, 0, 0, 2000000)
    // const p2 = addPlanet(-10, 0, 0, 2000000)
    // p1.vel.set(0, 2, 0)
    // p2.vel.set(0, -2, 0)
    const p3 = addPlanet(150, 0, 0, 6)
    p3.vel.set(0, 0, 30000)

    /* for (let i = 1; i < MAX_PLANETS; i++) {
        const planet = addPlanet(
            THREE.Math.randFloat(-300, 300),
            THREE.Math.randFloat(-300, 300),
            THREE.Math.randFloat(-300, 300),
            THREE.Math.randFloat(1, 10)
        )
        if (planet) {
            planet.vel.set(
                THREE.Math.randFloat(-2, 2),
                THREE.Math.randFloat(-2, 2),
                THREE.Math.randFloat(-2, 2)
            )
        }
    } */

    const material = new THREE.ShaderMaterial({
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

    const sphereGeometry = new THREE.SphereGeometry(900000, 32, 32)
    const texture = new THREE.TextureLoader().load('img/space_background.jpeg')
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    })
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    planetsMesh = new THREE.Points(geometry, material)
    planetGroup.add(planetsMesh)
    scene.add(planetGroup)

    renderer = new THREE.WebGLRenderer({ canvas })
    renderer.setSize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', onWindowResize, false)
    canvas.addEventListener('mousemove', onMouseMove, false)
    canvas.addEventListener('click', onMouseClick, false)
}

function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(planetGroup.children)
    if (intersects.length > 0) {
        const targetIndex = intersects[0].index
        handleSelect(planets[targetIndex])
        //breakPlanet(planets[targetIndex])
    }
    console.log(intersects)
}

function onMouseMove(event) {
    mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1
    mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    planetsMesh.material.uniforms.screenHeight.value = window.innerHeight
}

let prevTime = 0

function update(time, isPlaying, selected) {
    //update planet here
    const delta = time - prevTime
    prevTime = time
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
                if (planets[i].needRemove()) {
                    removePlanet(planets[i])
                } else {
                    planets[i].update(delta)
                }
            }
        }
    }
    for (let i = 0; i < planets.length; i++) {
        if (selected && i === selected.index) {
            planetsMesh.geometry.attributes.select.array[i] = 1
        } else {
            planetsMesh.geometry.attributes.select.array[i] = 0
        }
    }

    planetsMesh.geometry.attributes.select.needsUpdate = true
    sphere.position.copy(camera.position)

    renderer.render(scene, camera)
    controls.update()
}

export default { init, update }
