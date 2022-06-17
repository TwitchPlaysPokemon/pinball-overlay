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


function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180)
}

class Pinball extends Component {
    constructor(props) {
        super(props)
        this.state = { prevScore: 0, updateNumber: 0, prevPrevScore: 0 }
        this.canvasRef = React.createRef()
        this.canvasContext = null
        this.flashCanvasRef = React.createRef()
        this.flashCanvasContext = null
        this.tipCanvasRef = React.createRef()
        this.tipCanvasContext = null
        this.fadeFrames = 0
    }
    componentDidMount() {
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)
        this.canvasContext = this.canvasRef.current.getContext("2d")
        this.canvasContext.clearRect(0, 0, width, height);
        this.flashCanvasContext = this.flashCanvasRef.current.getContext("2d")
        this.flashCanvasContext.clearRect(0, 0, width, height);
        this.tipCanvasContext = this.tipCanvasRef.current.getContext("2d")
        this.tipCanvasContext.clearRect(0, 0, width, height);
        this.fadeFlashLayer = this.fadeFlashLayer.bind(this)
        window.requestAnimationFrame(this.fadeFlashLayer)
    }

    fadeFlashLayer() {
        this.fadeFrames += 1
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)
        if (this.fadeFrames % 30 === 0) {
            const ctx = this.canvasContext
            ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
            ctx.fillRect(0, 0, width, height)
            ctx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
        }
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
        let prevPrevScore = this.state.prevPrevScore
        const pointsPerMultiplier = this.props.pointsPerMultiplier
        if (score === prevScore) return
        if (score === 0) {
            prevScore = 0
            prevPrevScore = 0
        }
        const angleOffset = 42.46
        const prevAngle = degreesToRadians(((((prevScore % pointsPerMultiplier) / pointsPerMultiplier) * 360) - 0.25) + angleOffset)
        const prevAngle2 = degreesToRadians(((((prevScore % pointsPerMultiplier) / pointsPerMultiplier) * 360)) + angleOffset)
        const prevPrevAngle = degreesToRadians(((((prevPrevScore % pointsPerMultiplier) / pointsPerMultiplier) * 360) - 0.25) + angleOffset)
        const angle = degreesToRadians((((score % pointsPerMultiplier) / pointsPerMultiplier) * 360) + angleOffset)
        const angle2 = degreesToRadians(((((score % pointsPerMultiplier) / pointsPerMultiplier) * 360) + 0.25) + angleOffset)
        const ctx = this.canvasContext
        let hue = (this.state.updateNumber * 36) % 360
        //hue = (hue + ((360 / 3) * (this.state.updateNumber % 3))) % 360
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
        //ctx.fillRect(0, 0, this.props.borderSize, this.props.borderSize)
        const width = this.props.gameWidth + (this.props.borderSize * 2)
        const height = this.props.gameHeight + (this.props.borderSize * 2)
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
        const tipCtx = this.tipCanvasContext
        tipCtx.clearRect(0, 0, width, height)
        tipCtx.fillStyle = 'white'
        tipCtx.beginPath()
        tipCtx.moveTo(width / 2, height / 2)
        tipCtx.lineTo(
            (width / 2) + (Math.cos(prevAngle) * 400),
            (height / 2) + (Math.sin(prevAngle) * 400))
        tipCtx.lineTo(
            (width / 2) + (Math.cos(angle2) * 400),
            (height / 2) + (Math.sin(angle2) * 400))
        tipCtx.closePath()
        tipCtx.fill()
        const flashCtx = this.flashCanvasContext
        flashCtx.fillStyle = 'white'
        flashCtx.globalCompositeOperation = 'source-over'
        flashCtx.beginPath()
        flashCtx.moveTo(width / 2, height / 2)
        flashCtx.lineTo(
            (width / 2) + (Math.cos(prevPrevAngle) * 400),
            (height / 2) + (Math.sin(prevPrevAngle) * 400))
        flashCtx.lineTo(
            (width / 2) + (Math.cos(prevAngle2) * 400),
            (height / 2) + (Math.sin(prevAngle2) * 400))
        flashCtx.closePath()
        flashCtx.fill()

        // multiplier tick over
        const prevMultiplier = Math.floor(this.state.prevScore / this.props.pointsPerMultiplier)
        const multiplier = Math.floor(this.props.score / this.props.pointsPerMultiplier)
        if (multiplier > prevMultiplier) {
            flashCtx.fillRect(0, 0, width, height)
        }

        // clear when score is 0
        if (score === 0) {
            flashCtx.clearRect(0, 0, width, height)
            tipCtx.clearRect(0, 0, width, height)
            ctx.clearRect(0, 0, width, height)
        } else {
            flashCtx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
            tipCtx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
            ctx.clearRect(this.props.borderSize, this.props.borderSize, this.props.gameWidth, this.props.gameHeight)
        }

        this.setState({
            prevScore: score,
            prevPrevScore: prevScore,
            updateNumber: this.state.updateNumber + 1
        })
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
                    ref={this.canvasRef}
                    width={width}
                    height={height}
                />
                <canvas
                    ref={this.flashCanvasRef}
                    width={width}
                    height={height}
                />
                <canvas
                    ref={this.tipCanvasRef}
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
    const response = await get('/pinball/emu-api-port');
    const text = await response.text();
    return parseInt(text);
}

async function getPinballTable() {
    const response = await get('/pinball/current-table');
    return await response.text();
}

async function getPinballMultipliers() {
    const response = await get('/pinball/multipliers');
    return response.json();
}

async function getPinballScore(emuPort) {
    const response = await get(`/emu/${emuPort}/WRAM/ReadU32LE/146A`);
    const text = await response.text();
    return parseInt(text + '0');
}


class App extends Component {
    constructor(props) {
        super(props)
        this.state = { score: 0, table: null, pointsPerMultiplier: null }
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
        } catch (e) {
            console.error(e);
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
                    pointsPerMultiplier: pointsPerMultiplier
                })
            } else {
                this.setState({ score: score })
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
        if (this.state.table !== null) {
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
