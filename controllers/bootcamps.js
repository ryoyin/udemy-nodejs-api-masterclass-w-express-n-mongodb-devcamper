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
getBootcamps = asyncHandler(async (req, res, next) => {
    let query

    // copy request query
    const reqQuery = {...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit']

    // loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param])

    console.log(reqQuery)

    let queryString = JSON.stringify(reqQuery)

    // create operators (gt, gte, lte)
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // finding resource
    query = Bootcamp.find(JSON.parse(queryString))

    // Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        console.log(fields)
        query = query.select(fields)
    }

    // Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }else {
        query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()
    
    query = query.skip(startIndex).limit(limit)

    const bootcamps = await query;

    // pagination result
    const pagination = {}
    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
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