import Planet from './planet'
import { vertexShader, fragmentShader } from './shader'
const { THREE } = window

let scene, camera, renderer, controls, mouse, raycaster

const MAX_PLANETS = 100
let planetsMesh
const planetsNotActive = []
const planetsActive = []

function addPlanet(x, y, z, m) {
    if (planetsNotActive.length > 0) {
        const planet = planetsNotActive.splice(0, 1)[0]
        planet.init(x, y, z, m)
        planet.setColor(0, Math.random(), Math.random())
        planetsActive.push(planet)
        // scene.add(planet.line)
        return planet
    }
}

function removePlanet(index) {
    const planet = planetsActive.splice(index, 1)[0]
    planet.destroy()
    planetsNotActive.push(planet)
    //  scene.remove(planet.line)
}

function breakPlanet(planet) {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children)
    for (let i = 0; i < intersects.length; i++) {
        for (let j = 0; j < planetsActive.length; j++) {
            if (intersects[i].index === planetsActive[j].index) {
                planetsActive[j].setColor(1, 0, 0)
                console.log(
                    planetsMesh.geometry.attributes.size.array[
                        intersects[i].index
                    ]
                )
                break
            }
        }
    }
    console.log(intersects)
}

function init(canvas) {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000000
    )

    camera.position.y = 500
    camera.lookAt(0, 0, 0)

    controls = new THREE.OrbitControls(camera)
    controls.update()

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(MAX_PLANETS * 3)
    const colors = new Float32Array(MAX_PLANETS * 3)
    const active = new Uint8Array(MAX_PLANETS)
    const size = new Float32Array(MAX_PLANETS).map(() => 20)

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('active', new THREE.BufferAttribute(active, 1))
    geometry.addAttribute('size', new THREE.BufferAttribute(size, 1))
    console.log(geometry)

    raycaster = new THREE.Raycaster()
    raycaster.params.Points.pointSize = geometry.attributes.size.array
    mouse = new THREE.Vector2()

    for (let i = 0; i < MAX_PLANETS; i++) {
        const planet = new Planet(i, geometry)
        planetsNotActive.push(planet)
    }

    addPlanet(0, 0, 0, 20000000)

    for (let i = 1; i < MAX_PLANETS; i++) {
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
    }
    // geometry.vertices = Array(MAX_PLANETS)
    //     .fill(0)
    //     .map(() => new THREE.Vector3())
    // geometry.colors = Array(MAX_PLANETS)
    //     .fill(0)
    //     .map(() => new THREE.Color(Math.random(), Math.random(), Math.random()))
    /*     for (let i = 0; i < MAX_PLANETS; i++) {
        const planet = new Planet(geometry.vertices[i], geometry.colors[i])
        planetsNotActive.push(planet)
    } */

    // const material = new THREE.PointsMaterial({
    //     vertexColors: THREE.VertexColors,
    //     size: 20
    // })

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        vertexColors: THREE.VertexColors,
        transparent: true,
        uniforms: {
            texture: {
                type: 't',
                value: new THREE.TextureLoader().load('img/planet.png')
            }
        }
    })

    planetsMesh = new THREE.Points(geometry, material)
    scene.add(planetsMesh)

    renderer = new THREE.WebGLRenderer({ canvas })
    renderer.setSize(window.innerWidth, window.innerHeight)

    window.addEventListener('mousemove', onMouseMove, false)
    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('click', breakPlanet, false)
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

async function update(time, isPlaying) {
    //update planet here
    if (isPlaying) {
        for (let i = planetsActive.length - 1; i >= 0; i--) {
            for (let j = planetsActive.length - 1; j >= 0; j--) {
                if (i !== j) {
                    planetsActive[i].applyForceFrom(planetsActive[j])
                }
            }
        }
        for (let i = planetsActive.length - 1; i >= 0; i--) {
            planetsActive[i].update()
        }
    }

    renderer.render(scene, camera)
    controls.update()
}

export default { init, update }
