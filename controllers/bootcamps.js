const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
// Example  Filter {{URL}}/api/v1/bootcamps?housing=false&location.city=Kingston&location.state=RI
// Example  Filter {{URL}}/api/v1/bootcamps?careers[in]=Business
// Example  Select {{URL}}/api/v1/bootcamps?select=name,description
// Example  Sort {{URL}}/api/v1/bootcamps?sort=name
// Example  Pagination {{URL}}/api/v1/bootcamps?page=2&limit=2
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
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
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // add user to req.body
    req.body.user = req.user.id

    // check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({
        user: req.user.id
    })

    // if the user is not an OfflineAudioCompletionEvent, they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.params.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body)

    res.status(201).json({
        success: true,
        data: bootcamp
    })
})

// @desc    Update bootcamp by id
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.udpateBootcamp = asyncHandler(async (req, res, next) => {
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
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400))
    }

    bootcamp.remove() // this will trigger middleware Bootcamp.schema.pre('remove')

    res.status(200).json({
        success: true,
        data: bootcamp
    })
})

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
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

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400))
    }

    if(!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400))
    }

    console.log(req.files.file)

    const file = req.files.file

    // Make sure the image is a photo
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image`, 400))
    }

    // Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    console.log(file.name)

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async error => {
        if(error) {
            console.error(error)
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({
            success: true,
            data: bootcamp
        })
    })
})