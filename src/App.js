import number0 from './img/0.png'
import number1 from './img/1.png'
import number2 from './img/2.png'
import number3 from './img/3.png'
import number4 from './img/4.png'
import number5 from './img/5.png'
import number6 from './img/6.png'
import number7 from './img/7.png'
import number8 from './img/8.png'
import number9 from './img/9.png'
import numberx from './img/x.png'
import './App.css'
import React, { Component } from 'react'

const POLLING_FPS = 60;

const NUMBER_IMGS = [
    number0, number1, number2, number3, number4, number5, number6, number7,
    number8, number9]
const OVERHANG = 0.15


function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180)
}

class Pinball extends Component {
    constructor(props) {
        super(props)
        this.state = { prevScore: 0, updateNumber: 0, color: 0 }
        this.canvasRef = React.createRef()
        this.canvasContext = null
        this.flashCanvasRef = React.createRef()
        this.flashCanvasContext = null
        this.bgCanvasRef = React.createRef()
        this.bgCanvasContext = null
        this.fadeFrames = 0
    }
    componentDidMount() {
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)
        this.canvasContext = this.canvasRef.current.getContext("2d")
        this.flashCanvasContext = this.flashCanvasRef.current.getContext("2d")
        this.flashCanvasContext.clearRect(0, 0, width, height);
        this.bgCanvasContext = this.bgCanvasRef.current.getContext("2d")
        this.bgCanvasContext.clearRect(0, 0, width, height);
        this.fadeFlashLayer = this.fadeFlashLayer.bind(this)
        window.requestAnimationFrame(this.fadeFlashLayer)
        this.bgCanvasContext.fillStyle = 'black'
        this.bgCanvasContext.fillRect(0,0, width, height)
        this.bgCanvasContext.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
    }

    fadeFlashLayer() {
        this.fadeFrames += 1
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)
        if (this.fadeFrames % 2 === 0) {
            const flashCtx = this.flashCanvasContext
            flashCtx.globalCompositeOperation = 'destination-out'
            flashCtx.fillStyle = 'rgba(0, 0, 0, 0.02)'
            flashCtx.fillRect(0, 0, width, height)
            flashCtx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
        }
        window.requestAnimationFrame(this.fadeFlashLayer)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const score = this.props.score
        let prevScore = this.state.prevScore
        const pointsPerMultiplier = this.props.pointsPerMultiplier
        const flashCtx = this.flashCanvasContext
        const bgCtx = this.bgCanvasContext
        if (score === prevScore) return
        if (score === 0) {
            prevScore = 0
        }
        const angleOffset = 42
        const prevDegrees = ((((prevScore % pointsPerMultiplier) / pointsPerMultiplier) * 360) - OVERHANG) + angleOffset
        const degrees = (((score % pointsPerMultiplier) / pointsPerMultiplier) * 360) + angleOffset
        const degreesDiff = ((score - prevScore) / pointsPerMultiplier) * 360
        const ctx = this.canvasContext
        //let hue = (this.state.updateNumber * 36) % 360
        let color = this.state.color
        if(degreesDiff > 2) {
            color += 1
            const hue = (color * 36) % 360
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
        } else {
            ctx.fillStyle = 'white'
        }
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)

        const a = degrees - angleOffset
        const b = prevDegrees - angleOffset
        if(a < b) {
            this.drawWedge(angleOffset, prevDegrees)
            console.log('divide')
            flashCtx.fillRect(0, 0, width, height)
            ctx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
            bgCtx.drawImage(this.canvasContext.canvas, 0, 0)
            bgCtx.fillStyle = 'rgba(0, 0, 0, 0.75)'
            bgCtx.fillRect(0, 0, width, height)
            this.canvasContext.clearRect(0, 0, width, height)
            this.drawWedge(degrees, angleOffset)
        } else {
            this.drawWedge(degrees, prevDegrees)
        }


        // clear when score is 0
        if (score === 0) {
            flashCtx.clearRect(0, 0, width, height)
            bgCtx.fillStyle = 'black'
            bgCtx.fillRect(0,0, width, height)
            ctx.clearRect(0, 0, width, height)
        }
        flashCtx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
        bgCtx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
        ctx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)


        // multiplier tick over
        //const prevMultiplier = Math.floor(this.state.prevScore / this.props.pointsPerMultiplier)
        //const multiplier = Math.floor(this.props.score / this.props.pointsPerMultiplier)

        this.setState({
            prevScore: score,
            color: color,
            updateNumber: this.state.updateNumber + 1
        })
    }

    drawWedgePart(angle, prevAngle) {
        angle = degreesToRadians(angle)
        prevAngle = degreesToRadians(prevAngle)
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)
        const ctx = this.canvasContext
        ctx.globalCompositeOperation = 'destination-over'
        ctx.beginPath()
        ctx.moveTo(width / 2, height / 2)
        ctx.lineTo(
            (width / 2) + (Math.cos(prevAngle) * 400),
            (height / 2) + (Math.sin(prevAngle) * 400))
        ctx.lineTo(
            (width / 2) + (Math.cos(angle) * 400),
            (height / 2) + (Math.sin(angle) * 400))
        ctx.closePath()
        ctx.fill()
        const flashCtx = this.flashCanvasContext
        flashCtx.fillStyle = 'white'
        flashCtx.globalCompositeOperation = 'source-over'
        flashCtx.beginPath()
        flashCtx.moveTo(width / 2, height / 2)
        flashCtx.lineTo(
            (width / 2) + (Math.cos(angle) * 400),
            (height / 2) + (Math.sin(angle) * 400))
        flashCtx.lineTo(
            (width / 2) + (Math.cos(prevAngle) * 400),
            (height / 2) + (Math.sin(prevAngle) * 400))
        flashCtx.closePath()
        flashCtx.fill()
    }

    drawWedge(angle, prevAngle) {
        let angleRange = angle - prevAngle
        while(angleRange > 0) {
            const amount = Math.min(angleRange, 45)
            this.drawWedgePart(prevAngle + amount, prevAngle - OVERHANG)
            angleRange -= amount
            prevAngle += amount
        }
    }

    render() {
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)
        const multiplierYOffset = 5 * this.props.scale
        const multiplierXOffset = 1 * this.props.scale
        const numbers = []
        const multiplier = Math.floor(this.props.score / this.props.pointsPerMultiplier)
        const numberChars = multiplier.toString()
        for (let i = 0; i < numberChars.length; i++) {
            numbers.push(<img key={i} alt="" src={NUMBER_IMGS[numberChars[i]]} />)
        }
        const multiplierStyle = {
            right: this.props.borderSize + multiplierXOffset,
            bottom: this.props.borderSize + multiplierYOffset,
            '--scale': this.props.scale
        }
        let placeholder = null
        /*
        placeholder = <img
            className="placeholder"
            alt=""
            style={{
                top: this.props.borderSize,
                left: this.props.borderSize,
                width: this.props.gameWidth,
                height: this.props.gameHeight}}
            src="https://www.mobygames.com/images/promo/l/106234-pokemon-pinball-screenshot.jpg"
        />
         */

        return (
            <div className="Pinball" style={{ width: width, height: height }}>
                <canvas
                    ref={this.bgCanvasRef}
                    width={width}
                    height={height}
                />
                <canvas
                    ref={this.canvasRef}
                    width={width}
                    height={height}
                />
                <canvas
                    ref={this.flashCanvasRef}
                    width={width}
                    height={height}
                />
                {placeholder}
                <div
                    className="multiplier"
                    key={multiplier}
                    style={multiplierStyle}>
                    {numbers}
                    <img alt="" src={numberx} />
                </div>
            </div>
        )
    }
}


async function get(url) {
    // console.log(url);
    const response = await fetch(url, {

    });
    if (response.ok)
        return response;
    throw response.statusText;
}

async function getEmuPort() {
    let url = '/pinball/emu-api-port'
    //url = 'http://localhost:5000' + url
    const response = await get(url);
    const text = await response.text();
    return parseInt(text);
}

async function getPinballTable() {
    let url = '/pinball/current-table'
    //url = 'http://localhost:5000' + url
    const response = await get(url);
    return await response.text();
}

async function getPinballMultipliers() {
    let url = '/pinball/multipliers'
    //url = 'http://localhost:5000' + url
    const response = await get(url);
    return response.json();
}

async function getPinballScore(emuPort) {
    const url = `/emu/${emuPort}/WRAM/ReadU32LE/146A`
    //const url = `http://localhost:${emuPort}/WRAM/ReadU32LE/146A`
    const response = await get(url);
    const text = await response.text();
    return parseInt(text + '0');
}


class App extends Component {
    constructor(props) {
        super(props)
        this.state = { score: 0, table: null, pointsPerMultiplier: null, visible: false}
        this.emuPort = null
        this.scoreRefresher = this.scoreRefresher.bind(this)
        this.scoreRefresherTimout = null
    }
    async scoreRefresher() {
        const startedAt = (new Date()).getTime()
        let score = null
        try {
            if (this.emuPort === null) this.emuPort = await getEmuPort()
            score = await getPinballScore(this.emuPort)
            console.log(score);
            if(isNaN(score)) {
                this.setState({visible: false})
                this.scoreRefresherTimout = setTimeout(this.scoreRefresher, 500)
                return
            }
        } catch (e) {
            console.error(e);
            this.setState({visible: false})
            this.scoreRefresherTimout = setTimeout(this.scoreRefresher, 500)
            return
        }
        if (score !== null && score !== this.state.score) {
            // score = 0 means game restarted
            if (score === 0 || this.state.table === null) {
                const table = await getPinballTable()
                const multipliers = await getPinballMultipliers()
                const pointsPerMultiplier = multipliers[table]
                this.setState({
                    score: score,
                    table: table,
                    pointsPerMultiplier: pointsPerMultiplier,
                    visible: true
                })
            } else {
                this.setState({ score: score, visible: true })
            }
        }
        const finishedAt = (new Date()).getTime()
        const durationMs = finishedAt - startedAt
        const sleepMs = Math.max(0, (1 / POLLING_FPS) - durationMs)
        this.scoreRefresherTimout = setTimeout(this.scoreRefresher, sleepMs)
    }

    async componentDidMount() {
        await this.scoreRefresher()
    }

    componentWillUnmount() {
        clearTimeout(this.scoreRefresherTimout)
    }

    render() {
        let pinball = null
        const scale = 1
        if (this.state.table !== null && this.state.visible) {
            pinball = <Pinball
                key={'pinball'}
                score={this.state.score}
                pointsPerMultiplier={this.state.pointsPerMultiplier}
                gameWidth={160 * scale}
                gameHeight={144 * scale}
                borderSize={4}
                scale={scale}
            />
        }
        return (
            <div className="App">
                {pinball}
            </div>
        )
    }
}


export default App
