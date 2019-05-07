import Planet from './planet'
const { THREE } = window

let scene, camera, renderer

let planetsMesh
let planets = []

function init(canvas) {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    camera.position.z = 5

    const geometry = new THREE.Geometry()
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })

    // add some planets here

    planetsMesh = new THREE.Points(geometry, material)

    scene.add(planetsMesh)

    renderer = new THREE.WebGLRenderer({ canvas })
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function update() {
    // update planet here

    planetsMesh.geometry.verticesNeedUpdate = true

    renderer.render(scene, camera)
}

export default { init, update }
