export default function dateShift(shift, instance = new Date()) {
    return new Date(instance.getTime() + shift)
}
