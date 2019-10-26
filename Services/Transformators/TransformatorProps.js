export default class TransformatorProps {
    static flag = {
        none: 0b0,
        autoUnlock: 0b1,
    }

    static type = {
        other: 0,
        encrypting: 1,
        signing: 2,
        hashing: 3,
        encoding: 4,
    }
}
