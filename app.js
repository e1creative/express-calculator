const express = require('express');
const ExpressError = require('./express-error')

const app = express();


// check our params before moving on
app.use((request, response, next) => {
    // if data is not all numbers return false
    if (!request.query.nums){
        return next(new ExpressError('Nums must not be empty', 400));
    }

    // split our params into an array and then run .every() on that array to check if every element is a num
    let test = request.query.nums.split(',').every(e => !isNaN(e))
    console.log('test: ', test)
    if (!test) {
        return next(new ExpressError('Nums must all be numbers', 400));
    }
    
    // if nums exist and all nums values are numbers
    return next();
})


// get the average
app.get('/mean', function(request, response, next){
    try {
        const numsArr = request.query.nums.split(',').map((val) => { return parseInt(val) })
    
        const mean = numsArr.reduce((currVal, nextVal) => currVal + nextVal) / numsArr.length

        return response.json({nums: numsArr, operation: 'mean', result: mean})
    
    } catch(e) {
        next(e);
    }
})

// get the midpoint
app.get('/median', function(request, response, next){
    try {
        const numsArr = request.query.nums.split(',').map((val) => { return parseInt(val) })

        // reorder the numsArr
        numsArr.sort();

        let finalVal;

        // if the array is uneven, we can get the middle number
        if (numsArr.length % 2 !== 0) {
            const medianIndex = Math.floor(numsArr.length/2);
            finalVal = numsArr[medianIndex]

        // if the array is even, we take the middle 2 numbers and get the average
        } else {
            const lowMedianIndex = (numsArr.length/2) - 1;
            const highMedianIndex = numsArr.length/2

            finalVal = (numsArr[lowMedianIndex] + numsArr[highMedianIndex]) / 2;
        }
        
        return response.json({nums: numsArr, operation: 'median', result: finalVal})

    } catch(e) {
        next(e)
    }
})

// get the number with the highest frequency
app.get('/mode', function(request, response, next){
    try {
        const numsArr = request.query.nums.split(',').map((val) => { return parseInt(val) })

        const counts = numsArr.reduce((count, e) => {
            if (!(e in count)) {
                count[e] = [0, e];
            }
        
            count[e][0]++;

            return count;
        }, {})

        console.log('counts [count, val]', counts)

        // use the values in our object (which are arrays [count, val]) to find the most frequest val
        const finalArr = Object.values(counts).reduce((a, v) => {
            return v[0] < a[0] ? a : v
        });

        console.log('final: ', finalArr)

        return response.json(
            {
                nums: numsArr, 
                operation: 'mode', 
                result: {
                    val: finalArr[1], 
                    frequency: finalArr[0]
                }
            }
        )

    } catch(e) {
        next(e)
    }
})

// 404 handler
app.use((request, response, next) => {
    const e = new ExpressError('Page Not Found', 404)
    next(e);
})


// our error handler to be called when we pass a value to next()
app.use((error, request, response, next) => {
    let status = error.status || 500;
    let message = error.message

    return response.status(status).json(
        { error: { message, status } }
    ) 
})

app.listen(3000, function(){
    console.log('App on port 3000')
})