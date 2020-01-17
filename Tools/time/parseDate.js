export default function parseDate(s) {
    const b = s.split(/\D/)
    return new Date(b[0], --b[1], b[2])
}
