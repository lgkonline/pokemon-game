const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const boundaries = []
const offset = {
    x: -735,
    y: -650
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

const image = new Image()
image.src = "./img/Pellet Town.png"

const foregroundImage = new Image()
foregroundImage.src = "./img/foregroundObjects.png"

const playerDownImage = new Image()
playerDownImage.src = "./img/playerDown.png"

const playerUpImage = new Image()
playerUpImage.src = "./img/playerUp.png"

const playerLeftImage = new Image()
playerLeftImage.src = "./img/playerLeft.png"

const playerRightImage = new Image()
playerRightImage.src = "./img/playerRight.png"

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: { max: 4 },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage
    }
})

const background = new Sprite({
    position: { x: offset.x, y: offset.y },
    image: image
})

const foreground = new Sprite({
    position: { x: offset.x, y: offset.y },
    image: foregroundImage
})

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

const movables = [background, ...boundaries, foreground]

function rectangularCollision({ reactangle1, reactangle2 }) {
    return (
        reactangle1.position.x + reactangle1.width >= reactangle2.position.x &&
        reactangle1.position.x <= reactangle2.position.x + reactangle2.width &&
        reactangle1.position.y <= reactangle2.position.y + reactangle2.height &&
        reactangle1.position.y + reactangle1.height >= reactangle2.position.y
    )
}

function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach((boundary) => boundary.draw())
    player.draw()
    foreground.draw()

    let moving = true
    player.moving = false
    if (keys.w.pressed && lastKey === "w") {
        player.moving = true
        player.image = player.sprites.up

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => (movable.position.y += 3))
        }
    } else if (keys.a.pressed && lastKey === "a") {
        player.moving = true
        player.image = player.sprites.left

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => (movable.position.x += 3))
        }
    } else if (keys.s.pressed && lastKey === "s") {
        player.moving = true
        player.image = player.sprites.down

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => (movable.position.y -= 3))
        }
    } else if (keys.d.pressed && lastKey === "d") {
        player.moving = true
        player.image = player.sprites.right

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => (movable.position.x -= 3))
        }
    }
}
animate()

let lastKey = ""

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = true
            lastKey = "w"
            break
        case "a":
            keys.a.pressed = true
            lastKey = "a"
            break
        case "s":
            keys.s.pressed = true
            lastKey = "s"
            break
        case "d":
            keys.d.pressed = true
            lastKey = "d"
            break
    }
})

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = false
            break
        case "a":
            keys.a.pressed = false
            break
        case "s":
            keys.s.pressed = false
            break
        case "d":
            keys.d.pressed = false
            break
    }
})
