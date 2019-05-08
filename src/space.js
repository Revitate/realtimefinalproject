import Planet from './planet'
const { THREE } = window

let scene, camera, renderer, controls

let planetsMesh
let planets = []

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

    const geometry = new THREE.Geometry()
    const material = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors,
        size: 20
    })

    // add some planets here
    planets.push(new Planet(0, 0, 0, 20000000))
    geometry.vertices.push(planets[0].pos)
    geometry.colors.push(
        new THREE.Color(Math.random(), Math.random(), Math.random())
    )
    for (let i = 0; i < 1000; i++) {
        const pos = new THREE.Vector3(
            THREE.Math.randInt(-200, 200),
            THREE.Math.randInt(-200, 200),
            THREE.Math.randInt(-200, 200)
        )
        const color = new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
        )
        const planet = new Planet(
            pos.x,
            pos.y,
            pos.z,
            THREE.Math.randInt(0, 10),
            color
        )
        planet.vel.set(
            THREE.Math.randInt(-1, 1),
            THREE.Math.randInt(-1, 1),
            THREE.Math.randInt(-1, 1)
        )
        planets.push(planet)
        geometry.vertices.push(planet.pos)
        geometry.colors.push(color)

        scene.add(planet.line)
    }

    planetsMesh = new THREE.Points(geometry, material)
    scene.add(planetsMesh)
    renderer = new THREE.WebGLRenderer({ canvas })
    renderer.setSize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function update() {
    // update planet here
    for (let i = planets.length - 1; i >= 0; i--) {
        for (let j = planets.length - 1; j >= 0; j--) {
            if (i !== j) {
                planets[i].applyForceFrom(planets[j])
            }
        }
    }

    for (let i = planets.length - 1; i >= 0; i--) {
        planets[i].update()
    }

    planetsMesh.geometry.verticesNeedUpdate = true

    renderer.render(scene, camera)
    controls.update()
}

export default { init, update }
