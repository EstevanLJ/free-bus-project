let busId = 1;
let lineId = 1;
let transformerId = 1;

let stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight - 100
});

let layer = new Konva.Layer();
stage.add(layer);

class Bus {

    constructor(config) {
        this.element = new Konva.Rect({
            x: config.x,
            y: config.y,
            width: 100,
            height: 15,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 0,
            draggable: true
        });

        this.id = busId
        busId++

        this.element.on('mouseover', () => {
            this.element.fill('#777')
            this.element.draw()
            document.body.style.cursor = 'pointer';
        });

        this.element.on('mouseout', () => {
            this.element.fill('black')
            this.element.draw()
            document.body.style.cursor = 'default';
        });

        this.horizontal = true
        this.transmissionLines = []

        layer.add(this.element)
    }

    rotate() {
        this.horizontal = !this.horizontal

        if (this.horizontal) {
            this.element.rotate(-90)
        } else {
            this.element.rotate(90)
        }

        this.transmissionLines.forEach((tl) => {
            tl.updatePoints()
        })

    }

    centerX() {
        return this.horizontal ?
            this.element.x() + this.element.width() / 2 :
            this.element.x() - this.element.height() / 2
    }

    centerY() {
        return this.horizontal ?
            this.element.y() + this.element.height() / 2 :
            this.element.y() + this.element.width() / 2
    }

}

class Transformer {

    constructor(config) {
        this.element = new Konva.Group({
            x: config.x,
            y: config.y,
            draggable: true
        });

        this.element.add(new Konva.Circle({
            x: config.x - 19,
            y: config.y - 52,
            radius: 5,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 3
        }))

        this.element.add(new Konva.Circle({
            x: config.x,
            y: config.y - 21,
            radius: 25,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 3
        }))

        this.element.add(new Konva.Circle({
            x: config.x,
            y: config.y + 21,
            radius: 25,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 3
        }))

        this.id = transformerId
        transformerId++

        layer.add(this.element)
    }

}

class TransmissionLine {

    constructor(from, to) {

        this.from = from
        this.to = to

        this.from.transmissionLines.push(this)
        this.to.transmissionLines.push(this)

        this.element = new Konva.Line({
            points: [
                this.from.element.x(), this.from.element.y(),
                this.to.element.x(), this.to.element.y(),
            ],
            stroke: 'black',
            strokeWidth: 3,
            lineCap: 'round',
            lineJoin: 'round'
        });

        this.id = lineId
        lineId++

        this.from.element.on('dragmove', () => {
            this.updatePoints()
        })

        this.to.element.on('dragmove', () => {
            this.updatePoints()
        })

        this.updatePoints()

        layer.add(this.element)
    }

    updatePoints() {

        this.element.points([
            this.from.centerX(), this.from.centerY(),
            this.to.centerX(), this.to.centerY(),
        ])
    }

}

let buses = []
let tls = []

//Load the data
axios.get('file.json').then((res) => {

    res.data.buses.forEach((bus) => {
        const newBus = new Bus({
            x:bus.x,
            y:bus.y,
        })

        if (!bus.horizontal) {
            newBus.rotate()
        }
        
        buses.push(newBus)
    })

    res.data.tls.forEach((tl) => {
        tls.push(new TransmissionLine(
            buses[tl[0]],
            buses[tl[1]]
        ))
    })

    let t = new Transformer({
        x: 100,
        y: 100
    })

    layer.draw();
})

let salvar = function () {

    let saveBuses = []
    let saveTls = []

    buses.forEach((bus) => {
        saveBuses.push({
            x: bus.element.x(),
            y: bus.element.y(),
            horizontal: bus.horizontal
        })
    })

    tls.forEach((tl) => {
        saveTls.push([
            getBusIndex(tl.from),
            getBusIndex(tl.to),
        ])
    })

    let data = {
        buses: saveBuses, 
        tls: saveTls
    }

    console.log(data)

    axios.post('save.php', {data}).then(() => {
        alert('Sucesso!')
    }).catch((err) => {
        console.log(err)
        alert('Erro ao salvar!')
    })

}

let adicionar = function () {
    buses.push(new Bus({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - 100
    }))

    buses.push(new Bus({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - 100
    }))

    tls.push(new TransmissionLine(
        buses[buses.length - 1],
        buses[buses.length - 2]
    ))

    layer.draw();
}

let girar = function () {
    buses[0].rotate()
    buses[1].rotate()
    buses[2].rotate()
    buses[3].rotate()

    layer.draw();
}

let getBusIndex = function(bus) {
    for(let i = 0; i < buses.length; i++) {
        if (buses[i].id === bus.id) {
            return i
        }
    }

    return -1
}