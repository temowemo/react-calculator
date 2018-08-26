import React from "react"
import ReactDOM from "react-dom"

import { keys } from "./ui-data"
import {
  keyMap,
  isOperator,
  isNumber,
  isValidChar,
  calc,
} from "./utils"

import "./styles.css"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.initialState = {
      displayText: "0",
      scale: 1,
      history: [],
      lastOperator: null,
      x: 0,
      activeKeys: {},
    }
    this.state = this.initialState
    this.app = React.createRef()
    this.display = React.createRef()
    this.displayText = React.createRef()
  }
  componentDidMount() {
    this.app.current.focus()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.displayText !== this.state.displayText) {
      this.handleFontSize()
    }
  }
  handleKeyPress = e => {
    const char = String.fromCharCode(e.charCode)
    if (char.trim()) {
      this.handleKeySelect(char)
    }
  }
  handleKeyDown = e => {
    if ([8, 46].includes(e.keyCode)) {
      this.handleKeySelect("backspace")
    }
    if ([13].includes(e.keyCode)) {
      this.handleKeySelect("=")
    }
  }
  handleKeyClick = value => e => {
    const char = keyMap[value] || value
    if (char) {
      this.handleKeySelect(char)
    }
  }
  handleFontSize = () => {
    const display = this.display.current
    if (display) {
      const paddingLeft = Number(
        getComputedStyle(display, null)
          .getPropertyValue("padding-left")
          .replace("px", "")
      )
      const paddingRight = Number(
        getComputedStyle(display, null)
          .getPropertyValue("padding-right")
          .replace("px", "")
      )
      const displayWidth = display.clientWidth
      const padding = paddingLeft + paddingRight
      const maxWidth = displayWidth - padding
      const displayText = this.displayText.current
      const displayTextWidth =
        displayText && displayText.clientWidth
      if (displayTextWidth >= maxWidth) {
        this.setState({
          scale: maxWidth / displayTextWidth,
        })
      } else {
        this.setState({
          scale: 1,
        })
      }
    }
  }
  handleAnimation = char => {
    this.setState(
      prevState => {
        return {
          ...prevState,
          activeKeys: {
            ...prevState.activeKeys,
            [char]: true,
          },
        }
      },
      () => {
        setTimeout(() => {
          this.setState(prevState => {
            return {
              ...prevState,
              activeKeys: {
                ...prevState.activeKeys,
                [char]: false,
              },
            }
          })
        }, 100)
      }
    )
  }
  handleVibrate = () => {
    const isMobile = /iPhone|iPod|iPad|Android|BlackBerry/.test(
      navigator.userAgent
    )
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }
  handleKeySelect = char => {
    const {
      displayText,
      history,
      lastOperator,
      x,
      activeKeys,
    } = this.state
    if (!isValidChar(char)) {
      return
    }

    this.handleAnimation(char)
    this.handleVibrate()

    if (char === "C") {
      return this.setState(this.initialState)
    } else if (char === "±") {
      return this.setState({
        displayText:
          displayText === "0"
            ? displayText
            : displayText.includes("-")
              ? displayText.replace("-", "")
              : `-${Number(displayText)}`,
      })
    } else if (char === "%") {
      return this.setState({
        displayText: `${Number(displayText / 100)}`,
      })
    } else if (isNumber(char)) {
      return isOperator(history[history.length - 1]) ||
        history[history.length - 1] === "="
        ? this.setState({
            displayText: `${char}`,
            history: [...history, char],
          })
        : this.setState({
            displayText:
              displayText === "0"
                ? `${char}`
                : `${displayText}${char}`,
            history: [...history, char],
          })
    } else if (char === ".") {
      return isOperator(history[history.length - 1]) ||
        history[history.length - 1] === "="
        ? this.setState({
            displayText: `0${char}`,
            history: [...history, char],
          })
        : this.setState({
            displayText: !displayText.includes(char)
              ? `${displayText}${char}`
              : displayText,
            history: [...history, char],
          })
    } else if (isOperator(char)) {
      return isOperator(history[history.length - 1])
        ? this.setState({
            lastOperator: char,
            history: [...history.slice(0, -1), char],
          })
        : this.setState({
            displayText: `${calc(
              x,
              lastOperator,
              Number(displayText)
            )}`,
            lastOperator: char,
            history: [...history, char],
            x: calc(x, lastOperator, Number(displayText)),
          })
    } else if (char === "=") {
      return this.setState({
        displayText: `${calc(
          x,
          !isOperator(history[history.length - 1]) &&
            lastOperator,
          Number(displayText)
        )}`,
        lastOperator: null,
        history:
          history[history.length - 1] === "="
            ? [...history]
            : [...history, char],
        x: calc(
          x,
          !isOperator(history[history.length - 1]) &&
            lastOperator,
          Number(displayText)
        ),
      })
    } else if (char === "backspace") {
      return this.setState({
        displayText: `${displayText.slice(0, -1)}` || "0",
      })
    }
  }
  render() {
    const { displayText, scale, activeKeys } = this.state
    return (
      <div
        className="app"
        onKeyPress={this.handleKeyPress}
        onKeyDown={this.handleKeyDown}
        tabIndex="0"
        ref={this.app}>
        <div className="calculator">
          <div
            className="grid-area-display"
            ref={this.display}>
            <span
              className="display-text"
              ref={this.displayText}
              style={{
                transform: `scale(${scale},${scale})`,
              }}>
              {displayText}
            </span>
          </div>
          <div className="grid-area-special">
            {keys.special.map((k, i) => {
              const keyValue = keyMap[k.value] || k.value
              const active = activeKeys[keyValue]
              return (
                <div
                  key={i}
                  className={`key ${!k.active &&
                    "disabled"} ${active && "active"}`}
                  onClick={
                    !k.active
                      ? null
                      : this.handleKeyClick(k.value)
                  }>
                  <span className="key-text">
                    {k.value}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="grid-area-normal">
            {keys.normal.map((k, i) => {
              const keyValue = keyMap[k.value] || k.value
              const active = activeKeys[keyValue]
              return (
                <div
                  key={i}
                  className={`key ${!k.active &&
                    "disabled"} ${active && "active"}`}
                  onClick={
                    !k.active
                      ? null
                      : this.handleKeyClick(k.value)
                  }>
                  <span className="key-text">
                    {k.value}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="grid-area-operator">
            {keys.operator.map((k, i) => {
              const keyValue = keyMap[k.value] || k.value
              const active = activeKeys[keyValue]
              return (
                <div
                  key={i}
                  className={`key ${!k.active &&
                    "disabled"} ${active && "active"}`}
                  onClick={
                    !k.active
                      ? null
                      : this.handleKeyClick(k.value)
                  }>
                  <span className="key-text">
                    {k.value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
