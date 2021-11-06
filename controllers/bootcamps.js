const ErrorResponse = require('../utils/errorResponse')
const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
getBootcamps = async (req, res, next) => {

    try {

        const bootcamps = await Bootcamp.find();

        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        })

    } catch (error) {

        next(error)

    }

}

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
getBootcamp = async (req, res, next) => {

    try {

        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400))
        }

        res.status(200).json({
            success: true,
            data: bootcamp
        })

    } catch (error) {

        next(error)

    }

}

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
createBootcamp = async (req, res, next) => {
    try {

        const bootcamp = await Bootcamp.create(req.body)
    
        res.status(201).json({
            success: true,
            data: bootcamp
        })
        
    } catch (error) {

        next(error)
        
    }
}

// @desc    Update bootcamp by id
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
udpateBootcamp = async (req, res, next) => {

    try {

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

    } catch (error) {

        next(error)

    }
    
}

// @desc    Delete bootcamp by id
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
deleteBootcamp = async (req, res, next) => {

    try {

        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 400))
        }

        res.status(200).json({
            success: true,
            data: bootcamp
        })

    } catch (error) {

        next(error)
        
    }
}

module.exports = { getBootcamps, getBootcamp, createBootcamp, udpateBootcamp, deleteBootcamp }