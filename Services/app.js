/* global __PACKAGE_VERSION_NUMBER, __PACKAGE_BUILD_TIME,
__PACKAGE_APP_NAME, __PACKAGE_BRANCH, __PACKAGE_CHANGELOG, __PACKAGE_BUILD_FLAGS */

export default class App {
    static get version() {
        return __PACKAGE_VERSION_NUMBER
    }

    static get buildDate() {
        return __PACKAGE_BUILD_TIME
    }

    static get appName() {
        return __PACKAGE_APP_NAME
    }

    static get branch() {
        return __PACKAGE_BRANCH
    }

    static get changelog() {
        return __PACKAGE_CHANGELOG
    }

    static get fullName() {
        return `${this.appName} ${this.version} (${this.branch})`
    }

    static get buildFlags() {
        return __PACKAGE_BUILD_FLAGS
    }

    static buildFlag(name) {
        return this.buildFlags.findIndex((e) => e === name) !== -1
    }

    static get debug() {
        return this.buildFlag("debug")
    }
}
