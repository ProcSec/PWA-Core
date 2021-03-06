import DOM from "@DOMPath/DOM/Classes/dom"
import FadeOut from "@Environment/Library/Animations/fadeOut"
import FadeIn from "@Environment/Library/Animations/fadeIn"
import CSSAnimation from "@DOMPath/Animation/Classes/CSSAnimation"
import EaseOutQuad from "@DOMPath/Animation/Library/Timing/easeOutQuad"
import EaseOutCubic from "@DOMPath/Animation/Library/Timing/easeOutCubic"
import Animation from "@DOMPath/Animation/Classes/Animation"
import SettingsStorage from "./Settings/SettingsStorage"
import Navigation from "./navigation"

export default class WindowManager {
    static windows = []

    static futureWindows = []

    static overlays = []

    static helpers = []

    static scaffoldBuild = false

    static controlWin = false

    static controlOver = false

    static controlHelp = false

    static advancedTransitionsCache = null

    static useCSSTransitionsCache = null

    static NoTransitionsCache = null

    static get advancedTransitions() {
        if (this.advancedTransitionsCache !== null) return this.advancedTransitionsCache
        SettingsStorage.getFlag("ui_wm_adv_transitions").then((r) => {
            this.advancedTransitionsCache = !!r
        })
        return false
    }

    static useCSSTransitions() {
        if (this.useCSSTransitionsCache !== null) return this.useCSSTransitionsCache
        SettingsStorage.getFlag("ui_wm_adv_css_transitions").then((r) => {
            this.useCSSTransitionsCache = !!r
        })
        return false
    }

    static get NoTransitions() {
        if (this.NoTransitionsCache !== null) return this.NoTransitionsCache
        SettingsStorage.getFlag("ui_wm_no_transitions").then((r) => {
            this.NoTransitionsCache = !!r
        })
        return false
    }

    static get fullscreen() { return document.webkitFullscreenElement !== null }

    static newWindow(h) {
        let w

        const movementListener = (ev) => {
            w.elementParse.native.scrollBy({ left: -ev.movementX })
        }
        const endListener = (ev) => {
            window.removeEventListener("mouseup", endListener, { passive: true })
            window.removeEventListener("mousemove", movementListener, { passive: true })
        }
        const startListener = () => {
            window.addEventListener("mouseup", endListener, { passive: true })
            window.addEventListener("mousemove", movementListener, { passive: true })
        }

        const self = this

        const wheelListener = (ev) => {
            this.controlWin.elementParse.native.scrollBy({ top: ev.deltaY * 2, behavior: "smooth" })
        }

        const listener = () => {
            if (w.elementParse.native.scrollWidth > w.elementParse.native.clientWidth) {
                w.style({
                    cursor: "w-resize",
                })
                window.addEventListener("mousedown", startListener, { passive: true })
                this.controlWin.elementParse.native.addEventListener("wheel", wheelListener, { passive: true })
            } else {
                w.style({
                    cursor: "",
                })
                window.removeEventListener("mousedown", startListener, { passive: true })
                this.controlWin.elementParse.native.removeEventListener("wheel", wheelListener, { passive: true })
            }
        }

        w = new DOM({
            new: "div",
            class: "s--wm-awi",
            id: `s--wm-win-${this.windows.length}`,
            onRendered() {
                listener(this)
                window.addEventListener("resize", listener)
            },
            onClear() {
                listener(this)
                window.addEventListener("resize", listener)
            },
        })

        const generated = w
        const prev = this.currentWindow.element
        this.windows.push(generated)

        async function basicTransition() {
            await new FadeOut({ duration: 200 }).apply(self.controlWin)
            self.controlWin.clear(generated)
            self.controlWin.elementParse.native.scrollTop = 0
            await new FadeIn({ duration: 200 }).apply(self.controlWin)
        }

        function CSSTransition() {
            requestAnimationFrame(() => {
                new CSSAnimation({
                    duration: 200,
                    timingFunc: "cubic-bezier(0.215, 0.61, 0.355, 1)",
                    start: {
                        opacity: 0,
                        transform: "scale(1.05)",
                        zIndex: 1,
                    },
                    end: {
                        opacity: 1,
                        transform: "scale(1)",
                        zIndex: 1,
                    },
                }).apply(generated)

                self.controlWin.render(generated)

                if (prev) {
                    const cw = self.controlWin
                    const curScroll = cw.elementParse.native.scrollTop
                    if (curScroll !== 0) {
                        new Animation({
                            duration: 100,
                            timingFunc: EaseOutQuad,
                            painter(time) {
                                cw.elementParse.native
                                    .scrollTop = Math.floor(curScroll * (1 - time))
                            },
                        }).apply(cw)
                    }
                    new CSSAnimation({
                        duration: 200,
                        timingFunc: "cubic-bezier(0.215, 0.61, 0.355, 1)",
                        start: {
                            opacity: 1,
                            transform: "scale(1)",
                            zIndex: 0,
                        },
                        end: {
                            opacity: 0,
                            transform: "scale(1.05)",
                            zIndex: 0,
                        },
                    }).apply(prev).then(() => prev.destructSelf())
                }
            })
        }

        function animateTransition() {
            if (self.NoTransitions) {
                prev.destructSelf()
                self.controlWin.render(generated)

                return
            }

            if (!self.advancedTransitions) {
                basicTransition()
                self.useCSSTransitions()
                return
            }

            if (self.useCSSTransitions()) {
                CSSTransition()
                return
            }

            if (prev) {
                const cw = self.controlWin
                const curScroll = cw.elementParse.native.scrollTop
                if (curScroll !== 0) {
                    new Animation({
                        duration: 100,
                        timingFunc: EaseOutQuad,
                        painter(time) {
                            cw.elementParse.native.scrollTop = Math.floor(curScroll * (1 - time))
                        },
                    }).apply(cw)
                }

                new Animation({
                    duration: 200,
                    painter(time) {
                        this.style({
                            opacity: 1 - time,
                            transform: `scale(${1 + 0.05 * time})`,
                            zIndex: 0,
                        })
                    },
                    timingFunc: EaseOutCubic,
                }).apply(prev).then(() => prev.destructSelf())
            }

            self.controlWin.render(generated)

            new Animation({
                duration: 200,
                painter(time) {
                    this.style({
                        opacity: time,
                        transform: `scale(${1 - 0.05 * (1 - time)})`,
                    })
                },
                timingFunc: EaseOutCubic,
            }).apply(generated)
        }

        animateTransition()
        if (typeof h === "function") h(w)
        return this.currentWindow
    }

    static get currentWindow() {
        const e = this.windows[this.windows.length - 1]
        return this.generateWindow(e)
    }

    static generateWindow(e) {
        return ({
            element: e,
            append: (p) => e.render(p),
            clear: () => { e.clear() },
            replace: (p) => { e.clear(p) },
        })
    }

    static generateOverlay(e) {
        e = e || [undefined, {}]
        return ({
            element: e[0],
            append: (p) => e[0].render(p),
            clear: () => { e[0].clear() },
            replace: (p) => { e[0].clear(p) },
            options: e[1],
            pop: () => {
                const i = this.overlays.indexOf(e)
                if (i === -1) return false
                if (e[0] === this.currentOverlay.element) {
                    this.popOverlay()
                    return true
                }
                e[0].destructSelf()
                this.overlays.splice(i, 1)
                return true
            },
        })
    }

    static newOverlay(options = {}) {
        const w = new DOM({
            new: "div",
            class: "s--wm-aoi",
            id: `s--wm-over-${this.overlays.length}`,

        })

        const generated = w

        this.overlays.push([generated, options])
        this.controlOver.render(generated)

        this.OverContainer(true)

        if (options.transclick) this.OverlayClicks(true)
        else this.OverlayClicks(false)

        return this.currentOverlay
    }

    static newHelper() {
        const w = new DOM({
            new: "div",
            class: "s--wm-ahi",
            id: `s--wm-helper-${this.helpers.length}`,

        })

        const generated = w

        this.helpers.push(generated)
        this.controlHelp.render(generated)

        return this.currentHelper
    }

    static generateHelper(e) {
        e = e || undefined
        return ({
            element: e,
            append: (p) => e.render(p),
            clear: () => { e.clear() },
            replace: (p) => { e.clear(p) },
            pop: () => {
                const i = this.helpers.indexOf(e)
                if (i === -1) return false
                this.helpers.splice(i, 1)
                this.controlHelp.elementParse.native.removeChild(e.elementParse.native)
                return true
            },
        })
    }

    static get currentHelper() {
        const e = this.helpers[this.helpers.length - 1]
        return this.generateHelper(e)
    }

    static get currentOverlay() {
        const e = this.overlays[this.overlays.length - 1]
        return this.generateOverlay(e)
    }

    static popOverlay() {
        this.currentOverlay.element.destructSelf()
        this.overlays.pop()
        const e = this.currentOverlay
        if (e.element !== undefined && e.element.elementParse.native !== undefined) {
            if (e.options.transclick) this.OverlayClicks(true)
            else this.OverlayClicks(false)
        } else this.OverContainer(false)
        return e
    }

    static OverContainer(state = true) {
        if (state) {
            this.generalOver.elementParse.native.classList.add("shown")
        } else {
            this.generalOver.elementParse.native.classList.remove("shown")
        }
    }

    static OverlayClicks(state = false) {
        if (state) {
            this.generalOver.elementParse.native.classList.add("transclick")
        } else {
            this.generalOver.elementParse.native.classList.remove("transclick")
        }
    }

    static closeAllOverlays() {
        this.controlOver.clear()
        this.overlays = []
        this.OverContainer(false)
        this.OverlayClicks(false)
    }

    static get Scaffold() {
        const wins = new DOM({
            new: "div",
            id: "s--wm-windows",
        })

        const oversLimit = new DOM({
            new: "div",
            id: "s--wm-overlays-container",
        })

        const overs = new DOM({
            new: "div",
            id: "s--wm-overlays",
            content: oversLimit,
        })

        const helpers = new DOM({
            new: "div",
            id: "s--wm-helpers",
        })

        const sc = [
            wins,
            overs,
            helpers,
        ]

        this.controlWin = wins
        this.controlOver = oversLimit
        this.generalOver = overs
        this.controlHelp = helpers
        this.scaffoldBuild = sc

        return sc
    }

    static navBack(a, b) {
        const last = this.windows.pop()

        this.futureWindows.push(last)
        const we = this.currentWindow
        if (we === undefined || we.element === undefined) return Navigation.go(a, b)
        this.controlWin.clear(we.element)

        return [this.generateWindow(last), this.currentWindow]
    }

    static navForward(a, b) {
        const last = this.futureWindows.pop()

        this.windows.push(last)

        const we = this.currentWindow
        if (we === undefined || we.element === undefined) return Navigation.go(a, b)
        this.controlWin.clear(we.element)

        return [this.generateWindow(last), this.currentWindow]
    }

    static async EnableFullScreenExperience() {
        if (!("webkitRequestFullscreen" in document.documentElement)
            || !(await SettingsStorage.getFlag("fullscreen_on_tap"))) return

        window.addEventListener("load", () => {
            document.documentElement.addEventListener("touchend", () => {
                if (!this.fullscreen) {
                    document.documentElement.webkitRequestFullscreen()
                }
            })
        })
    }
}
