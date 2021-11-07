const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamps = await Bootcamp.find();

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400))
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    })
})

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)

    res.status(201).json({
        success: true,
        data: bootcamp
    })
})

// @desc    Update bootcamp by id
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
udpateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators: true
    })

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400))
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    })    
})

// @desc    Delete bootcamp by id
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400))
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    })
})

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    // Get lag/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378lm
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [lng, lat], radius ] } }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

module.exports = { getBootcamps, getBootcamp, createBootcamp, udpateBootcamp, deleteBootcamp, getBootcampsInRadius }