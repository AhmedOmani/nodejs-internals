const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { Transform, PassThrough } = require("stream");

const filePath = path.join(__dirname , "london-crime-data.csv");
const readStream  = fs.createReadStream(filePath);
const passThroughStream = new PassThrough({ objectMode: true });

readStream.pipe(csv()).pipe(passThroughStream);

// Specialized Pipelines (Transform Streams) for each question.

// First Question: Did the number of crimes go up or down over the years?
const yearlyCrimeAggregator = new Transform({
    objectMode: true,
    transform(chunk , encoding , callback) {
        const year = chunk.year;
        this.yearsMap[year] = (this.yearsMap[year] || 0) + 1;
        callback(null);
    },
    final(callback) {
        console.log('\n*** Yearly Crime Trends ***');
        const sortedYears = Object.keys(this.yearsMap).sort();
        sortedYears.forEach(year => {
            console.log(`Year ${year}: ${this.yearsMap[year]} crimes`)
        });
        callback(null);
    },
    construct(callback) {
        this.yearsMap = {};
        callback(null);
    } 
});
passThroughStream.pipe(yearlyCrimeAggregator);

// Second Question: What are the most dangerous areas of London ?
const areaCrimeAggregator = new Transform({
    objectMode: true ,
    transform(chunk , encoding , callback) {
        const area = chunk.borough;
        this.areaMap[area] = (this.areaMap[area] || 0) + 1;
        callback(null);
    },
    final(callback) {
        console.log('\n*** Most Dangerous Areas ***');
        const sortedAreas = Object.entries(this.areaMap).sort(([, a], [, b]) => b - a);
        sortedAreas.slice(0 , 5).forEach(([area, count]) => {
            console.log(`${area}: ${count} crimes`);
        });
        callback(null);
    },
    construct(callback) {
        this.areaMap = {};
        callback(null);
    }
});
passThroughStream.pipe(areaCrimeAggregator);

// Third Question: What is common crime per area ?
const commonCrimeAggregator = new Transform({
    objectMode: true,
    transform(chunk , encoding , callback) {
        const area = chunk.borough;
        const crimeType = chunk['major_category'];
        if (area && crimeType) {
            if (!this.areaCrimeCounts[area]) {
                this.areaCrimeCounts[area] = {};
            }
            this.areaCrimeCounts[area][crimeType] = (this.areaCrimeCounts[area][crimeType] || 0) + 1;
        }
        callback(null);
    },
    final(callback) {
        console.log('\n*** Most Common Crime per Area ***');
        const results = {};
        for (const area in this.areaCrimeCounts) {
            if (Object.keys(this.areaCrimeCounts[area]).length > 0) {
                const crimes = this.areaCrimeCounts[area];
                const mostCommon = Object.entries(crimes).sort(([, a], [, b]) => b - a)[0];
                results[area] = mostCommon ? `${mostCommon[0]} (${mostCommon[1]})` : 'No crimes recorded';
            }
        }
        console.log(results);
        callback(null);
    },
    construct(callback) {
        this.areaCrimeCounts = {};
        callback(null);
    }
});
passThroughStream.pipe(commonCrimeAggregator);

// Fourth Question: What is the least common crime ?
const leastCommonCrimeAggregaton = new Transform({
    objectMode: true,
    transform(chunk , encoding , callback) {
        const crimeType = chunk['major_category'];
        if (crimeType) {
            this.crimeTypeCounts[crimeType] = (this.crimeTypeCounts[crimeType] || 0) + 1;
        }
        callback(null);
    },
    final(callback) {
        console.log('\n*** Least Common Crime ***');
        const leastCommon = Object.entries(this.crimeTypeCounts).sort(([, a],[, b]) => a - b)[0];
        if (leastCommon) {
            console.log(`The least common crime is "${leastCommon[0]}" with ${leastCommon[1]} occurrences.`);
        }
        callback(null);
    },
    construct(callback) {
        this.crimeTypeCounts = {};
        callback(null);
    }
});
passThroughStream.pipe(leastCommonCrimeAggregaton);