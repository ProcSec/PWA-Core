const reflect = (p) => p.then((data) => ({ data, status: true }),
    (data) => ({ data, status: false }))

export default reflect
