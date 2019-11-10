import randBetween from "./randBetween"

export default function randomFromArray(array) {
    if (!(array instanceof Array)) throw new Error("Only arrays supported")
    return array[randBetween(0, array.length - 1)]
}
