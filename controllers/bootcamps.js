// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Show all bootcamps` })
}

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
getBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Show bootcamp ${req.params.id}` })
}

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
createBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Create new bootcamp` })
}

// @desc    Update bootcamp by id
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
udpateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Update bootcamp ${req.params.id}` })
}

// @desc    Delete bootcamp by id
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Delete bootcamp ${req.params.id}` })
}

module.exports = { getBootcamps, getBootcamp, createBootcamp, udpateBootcamp, deleteBootcamp }